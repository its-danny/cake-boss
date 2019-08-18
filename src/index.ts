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
import IO from 'koa-socket-2';
import cors from '@koa/cors';
import Member from './entity/member';
import Server from './entity/server';
import User from './entity/user';
import { CommandArguments } from './utils/command-arguments';
import { EMOJI_JOB_WELL_DONE, EMOJI_WORKING_HARD, EMOJI_THINKING, EMOJI_CAKE, EMOJI_ERROR } from './utils/emoji';

dotenv.config({ path: `./.env` });

// Sentry

const SENTRY_DSN: string = process.env.SENTRY_DSN as string;
const SENTRY_DISABLED = !SENTRY_DSN || SENTRY_DSN === '';

if (!SENTRY_DISABLED) {
  Sentry.init({ dsn: SENTRY_DSN });
}

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

  if (NODE_ENV === 'production' && !SENTRY_DISABLED) {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
};

client.on('ready', async () => {
  client.user.setActivity(`in the kitchen! ${EMOJI_WORKING_HARD}`);

  client.guilds.forEach(async guild => {
    const server = await Server.findOne({ where: { discordId: guild.id }, relations: ['config'] });
    const member = guild.members.get(client.user.id);

    if (server && member) {
      member.setNickname(server.config.nickname);
    }
  });

  console.log(`${EMOJI_CAKE} Cake Boss online!`);
});

client.on('guildCreate', async (guild: Guild) => {
  await Server.findOrCreate(guild.id);
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

  const server = await Server.findOrCreate(message.guild.id);

  const { commandPrefix } = server.config;

  if (message.author.id !== client.user.id && cleanContent.startsWith(`${commandPrefix}`)) {
    try {
      const fetchedAuthorMember = await message.guild.fetchMember(message.author);
      await Member.findOrCreate(server.discordId, message.author.id, fetchedAuthorMember.id);

      // eslint-disable-next-line no-restricted-syntax
      for (const member of message.mentions.members) {
        // eslint-disable-next-line no-await-in-loop
        const fetchedMember = await message.guild.fetchMember(member[1]);
        // eslint-disable-next-line no-await-in-loop
        await Member.findOrCreate(server.discordId, fetchedMember.user.id, fetchedMember.id);
      }

      const context: CommandArguments = {
        client,
        message,
        deleteCaller: false,
        needsFetch: false,
        careAboutQuietMode: false,
        promisedOutput: null,
        reactions: null,
      };

      commandParser.parse(cleanContent.replace(`${commandPrefix}`, ''), context, async (error, argv) => {
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

        if (argv.needsFetch && (!server.config.quietMode || !argv.careAboutQuietMode)) {
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
              let react: string;

              if (/\b:\d{18}/.test(emoji)) {
                [react] = emoji.match(/\d{18}/)!;
              } else {
                react = emoji;
              }

              sentMessage!.react(react);
            });

            const toWatch = { message: sentMessage, reactions, userId: message.author.id };
            messagesToWatch.push(toWatch);
            const toWatchIndex = messagesToWatch.indexOf(toWatch);
            sentMessage.delete(1000 * 10).then(() => messagesToWatch.splice(toWatchIndex, 1));
          }
        }
      });
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
  // eslint-disable-next-line no-param-reassign
  context.body = 'ONLINE';
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
    cakes: (await Server.find()).map(s => s.totalEarnedByMembers()).reduce((a, b) => a + b),
  });
}, 3 * 1000);

// Start it all up

createConnection()
  .then(() => {
    const DISCORD_TOKEN: string = process.env.DISCORD_TOKEN as string;
    client.login(DISCORD_TOKEN);

    const API_PORT: string = process.env.API_PORT as string;

    if (API_PORT && API_PORT !== '') {
      api.listen(API_PORT, () => console.log('🚀 API online!'));
    }

    fs.writeFileSync('./.uptime', moment().utc(), 'utf8');

    schedule.scheduleJob('0 * * * *', async () => {
      const servers = await Server.find({ relations: ['config', 'members'] });

      servers.forEach(async server => {
        // eslint-disable-next-line no-param-reassign
        server.timeSinceLastReset += 1;

        if (server.timeSinceLastReset >= server.config.giveLimitHourReset) {
          // eslint-disable-next-line no-param-reassign
          server.timeSinceLastReset = 0;

          server.members.forEach(async member => {
            // eslint-disable-next-line no-param-reassign
            member.givenSinceReset = 0;
            await member.save();
          });

          await server.save();
        }
      });
    });
  })
  .catch(error => {
    if (NODE_ENV === 'production' && !SENTRY_DISABLED) {
      Sentry.captureException(error);
    } else {
      console.error(error);
    }
  });
