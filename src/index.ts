import 'reflect-metadata';
import dotenv from 'dotenv';
import Discord, { Message, Guild } from 'discord.js';
import * as Sentry from '@sentry/node';
import yargs from 'yargs';
import { createConnection } from 'typeorm';
import moment from 'moment';
import fs from 'fs';
import fsExtra from 'fs-extra';
import schedule from 'node-schedule';
import Koa from 'koa';
import Router from 'koa-router';
import IO from 'koa-socket-2';
import cors from '@koa/cors';
import Member from './entity/member';
import Server from './entity/server';
import User from './entity/user';
import { CommandArguments, CommandResponse } from './utils/command-interfaces';
import { EMOJI_JOB_WELL_DONE, EMOJI_WORKING_HARD, EMOJI_THINKING, EMOJI_CAKE, EMOJI_ERROR } from './utils/emoji';

dotenv.config({ path: `./.env` });

// Sentry

const SENTRY_DSN: string = process.env.SENTRY_DSN as string;
const SENTRY_DISABLED = !SENTRY_DSN || SENTRY_DSN === '';

if (!SENTRY_DISABLED) {
  Sentry.init({ dsn: SENTRY_DSN });
}

// Bot

const client = new Discord.Client({
  fetchAllMembers: true,
});

const NODE_ENV: string = process.env.NODE_ENV as string;

const commandParser = yargs
  .scriptName('[command-prefix]')
  .commandDir('commands/manage', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'production' ? 'js' : 'ts'] })
  .commandDir('commands/use', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'production' ? 'js' : 'ts'] })
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
  message.channel.send(`\u200B${EMOJI_ERROR} Uh oh, something broke!`);

  if (NODE_ENV === 'production' && !SENTRY_DISABLED) {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
};

client.on('ready', async () => {
  client.user.setActivity(`in the kitchen! ${EMOJI_WORKING_HARD}`);

  client.guilds.forEach(async guild => {
    const server = await Server.findOne({ where: { discordId: guild.id } });
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
    await server.save();
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

  if (
    message.author.id !== client.user.id &&
    !message.author.bot &&
    (cleanContent.startsWith(`${commandPrefix}`) || message.isMemberMentioned(client.user))
  ) {
    try {
      await Member.findOrCreate(server.discordId, message.author.id, message.member.id);

      // eslint-disable-next-line no-restricted-syntax
      for (const member of message.mentions.members) {
        // eslint-disable-next-line no-await-in-loop
        await Member.findOrCreate(server.discordId, member[1].user.id, member[1].id);
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

      let command = cleanContent.replace(commandPrefix, '');

      if (message.isMemberMentioned(client.user) && message.mentions.members.get(client.user.id)) {
        const mentionRegex = new RegExp(`<@!?${message.mentions.members.get(client.user.id)!.id}>`);
        command = command.replace(mentionRegex, '');
      }

      commandParser.parse(command, context, async (error, argv) => {
        if (error) {
          if (error.name === 'YError') {
            message.channel.send(
              `\u200B${EMOJI_WORKING_HARD} Looks like you need some help! Check the commands here: <https://dannytatom.github.io/cake-boss/>`,
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
          sentMessage = (await message.channel.send(`\u200B${EMOJI_THINKING}`)) as Message;
        }

        if (argv.help) {
          message.channel.send(
            `\u200B${EMOJI_WORKING_HARD} Looks like you need some help! Check the commands here: <https://dannytatom.github.io/cake-boss/>`,
          );
        }

        if (argv.promisedOutput) {
          const commandResponse: CommandResponse = (await argv.promisedOutput) as CommandResponse;

          if (sentMessage) {
            await sentMessage.edit(
              `\u200B${commandResponse.content}`,
              commandResponse.messageOptions || commandResponse.richEmbed,
            );
          } else {
            sentMessage = (await message.channel.send(
              `\u200B${commandResponse.content}`,
              commandResponse.messageOptions || commandResponse.richEmbed || commandResponse.attachment,
            )) as Message;
          }

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
            sentMessage.delete(1000 * server.config.redeemTimer).then(() => messagesToWatch.splice(toWatchIndex, 1));
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
    servers: await Server.count(),
    users: await User.count(),
    cakes: (await Server.find()).map(s => s.totalEarnedByMembers()).reduce((a, b) => a + b),
  };
});

setInterval(async () => {
  io.broadcast('live', {
    servers: await Server.count(),
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

    fs.writeFileSync(`${process.cwd()}/.uptime`, moment().utc(), 'utf8');

    schedule.scheduleJob('0 * * * *', async () => {
      const servers = await Server.find({ where: { active: true } });

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
        }

        await server.save();
      });
    });

    schedule.scheduleJob('*/10 * * * *', async () => {
      await fsExtra.emptyDir(`${process.cwd()}/tmp/`);
    });
  })
  .catch(error => {
    if (NODE_ENV === 'production' && !SENTRY_DISABLED) {
      Sentry.captureException(error);
    } else {
      console.error(error);
    }
  });
