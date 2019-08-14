import 'reflect-metadata';
import dotenv from 'dotenv';
import Discord, { Message, Guild } from 'discord.js';
import * as Sentry from '@sentry/node';
import yargs from 'yargs';
import { createConnection } from 'typeorm';
import moment from 'moment';
import fs from 'fs';
import schedule from 'node-schedule';
import Koa from 'koa';
import Router from 'koa-router';
import IO from 'koa-socket';
import cors from '@koa/cors';
import { setupServer } from './utils/server-status';
import Server from './entity/server';
import { EMOJI_JOB_WELL_DONE, EMOJI_WORKING_HARD, EMOJI_THINKING, EMOJI_CAKE, EMOJI_ERROR } from './utils/emoji';
import User from './entity/user';

dotenv.config({ path: `./.env` });

// Sentry

const SENTRY_DSN: string = process.env.SENTRY_DSN as string;
Sentry.init({ dsn: SENTRY_DSN });

// Bot

const client = new Discord.Client();

const NODE_ENV: string = process.env.NODE_ENV as string;

const commandParser = yargs
  .scriptName('[command-prefix]')
  .commandDir('commands/manage', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'production' ? 'js' : 'ts'] })
  .commandDir('commands/use', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'production' ? 'js' : 'ts'] })
  .strict(true)
  .showHelpOnFail(true)
  .wrap(null)
  .help();

interface WatchedMessage {
  message: Message;
  reactions: { [key: string]: () => void };
  userId: string;
}

const messagesToWatch: WatchedMessage[] = [];

const handleError = async (error: Error, message: Message) => {
  message.channel.send(`${EMOJI_ERROR} Uh oh, something broke!`);

  if (NODE_ENV === 'production') {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
};

client.on('ready', async () => {
  client.user.setActivity(`in the kitchen! 😅`);

  client.guilds.forEach(async guild => {
    const server = await Server.findOne({ where: { discordId: guild.id }, relations: ['config'] });
    const member = guild.members.get(client.user.id);

    if (server && server.config.nickname && member) {
      member.setNickname(server.config.nickname);
    }
  });

  console.log(`${EMOJI_CAKE} Cake Boss online!`);
});

client.on('guildCreate', async (guild: Guild) => {
  await setupServer(guild.id);
});

client.on('guildDelete', async (guild: Guild) => {
  const server = await Server.findOne({ where: { discordId: guild.id } });

  if (server) {
    server.active = false;
    server.save();
  }
});

client.on('messageReactionAdd', (reaction, user) => {
  messagesToWatch.forEach(async (watching, index) => {
    if (user.id === watching.userId && Object.hasOwnProperty.call(watching.reactions, reaction.emoji.toString())) {
      watching.reactions[reaction.emoji.toString()]();
      watching.message.edit(`${EMOJI_JOB_WELL_DONE} Prize redeemed!`);
      messagesToWatch.splice(index, 1);
    }
  });
});

client.on('message', async (message: Message) => {
  const cleanContent = message.content
    .trim()
    .split(' ')
    .map((s, i) => (i === 0 ? s.toLowerCase() : s))
    .join(' ');

  let server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (!server) {
    server = await setupServer(message.guild.id);
  }

  const { commandPrefix } = server.config;

  if (message.author.id !== client.user.id && cleanContent.startsWith(`${commandPrefix}`)) {
    try {
      // NOTE: I'm not entirely sure how or where to type these,
      // so putting this comment here to remind myself what is what.
      //
      // deleteCaller    boolean
      // needsFetch:     boolean
      // promisedOutput: Promise<string> | null
      // reactions:      {[key: string]: () => void} | null
      commandParser.parse(
        cleanContent.replace(`${commandPrefix}`, ''),
        { client, message, deleteCaller: false, needsFetch: false, promisedOutput: null, reactions: null },
        async (error, argv) => {
          if (error) {
            if (error.name === 'YError') {
              message.channel.send(
                `${EMOJI_WORKING_HARD} Looks like you need some help! Check the commands here: <https://dannytatom.github.io/cake-boss/>`,
              );
            } else {
              handleError(error, message);
            }
          }

          if (argv.deleteCaller) {
            message.delete();
          }

          let sentMessage: Message | null = null;

          if (argv.needsFetch) {
            sentMessage = (await message.channel.send(EMOJI_THINKING)) as Message;
          }

          if (argv.help) {
            message.channel.send(
              `${EMOJI_WORKING_HARD} Looks like you need some help! Check the commands here: <https://dannytatom.github.io/cake-boss/>`,
            );
          }

          if (argv.promisedOutput) {
            let commandOutput: string[] | string = (await argv.promisedOutput) as string[] | string;

            if (!Array.isArray(commandOutput)) {
              commandOutput = [commandOutput];
            }

            commandOutput.forEach(async (out, i) => {
              if (sentMessage && i === 0) {
                sentMessage.edit(out);
              } else {
                sentMessage = (await message.channel.send(out)) as Message;
              }
            });

            const reactions = argv.reactions as { [key: string]: () => void } | null;

            if (sentMessage && reactions) {
              Object.keys(reactions).forEach(emoji => {
                sentMessage!.react(emoji);
              });

              const toWatch = { message: sentMessage, reactions, userId: message.author.id };
              messagesToWatch.push(toWatch);
              const toWatchIndex = messagesToWatch.indexOf(toWatch);
              sentMessage.delete(1000 * 10).then(() => messagesToWatch.splice(toWatchIndex, 1));
            }
          }
        },
      );
    } catch (error) {
      handleError(error, message);
    }
  }
});

// API

const api = new Koa();
const router = new Router();
const io = new IO();

api.use(cors());
api.use(router.routes());
api.use(router.allowedMethods());

io.attach(api);

router.get('/ping', context => {
  context.body = 'ONLINE';
});

router.get('/leaderboard', async context => {
  const allUsers = await User.find({ relations: ['members'] });
  let topUsers: any[] = [];

  if (allUsers) {
    const top = allUsers
      .sort((user1, user2) => {
        return user2.totalEarned() - user1.totalEarned();
      })
      .slice(0, 10);

    topUsers = await Promise.all(
      top.map(async user => {
        const discordUser = await client.fetchUser(user.discordId);

        if (discordUser) {
          return { name: `@${discordUser.username}`, earned: user.totalEarned() };
        }
      }),
    );
  }

  const allServers = await Server.find({ where: { active: true }, relations: ['members'] });
  let topServers: any[] = [];

  if (allServers) {
    const top = allServers
      .sort((server1, server2) => {
        return server2.totalEarnedByMembers() - server1.totalEarnedByMembers();
      })
      .slice(0, 10);

    topServers = await Promise.all(
      top.map(async server => {
        const discordServer = client.guilds.get(server.discordId);

        if (discordServer) {
          return { name: discordServer.name, earned: server.totalEarnedByMembers() };
        }
      }),
    );
  }

  context.body = { topUsers, topServers };
});

io.on('join', async () => {
  return {
    servers: await Server.count({ where: { active: true } }),
    users: await User.count(),
  };
});

setInterval(async () => {
  io.broadcast('live', {
    servers: await Server.count({ where: { active: true } }),
    users: await User.count(),
  });
}, 3 * 1000);

// Start it all up

createConnection()
  .then(() => {
    const DISCORD_TOKEN: string = process.env.DISCORD_TOKEN as string;
    client.login(DISCORD_TOKEN);

    const API_PORT: string = process.env.API_PORT as string;
    api.listen(API_PORT, () => console.log('🚀 API online!'));

    fs.writeFileSync('./.uptime', moment().utc(), 'utf8');

    schedule.scheduleJob('0 * * * *', async () => {
      const servers = await Server.find({ relations: ['config', 'members'] });

      servers.forEach(async server => {
        server.timeSinceLastReset += 1;

        if (server.timeSinceLastReset >= server.config.giveLimitHourReset) {
          server.timeSinceLastReset = 0;

          server.members.forEach(async member => {
            member.givenSinceReset = 0;
            await member.save();
          });

          await server.save();
        }
      });
    });
  })
  .catch(error => {
    if (NODE_ENV === 'production') {
      Sentry.captureException(error);
    } else {
      console.error(error);
    }
  });
