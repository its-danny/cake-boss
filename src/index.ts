import 'reflect-metadata';
import dotenv from 'dotenv';
import Discord, { Message, Guild } from 'discord.js';
import * as Sentry from '@sentry/node';
import yargs from 'yargs';
import { createConnection } from 'typeorm';
import moment from 'moment';
import fs from 'fs';
import schedule from 'node-schedule';
import { logError } from './utils/logger';
import { setupServer } from './utils/server-status';
import Server from './entity/server';
import { EMOJI_JOB_WELL_DONE, EMOJI_WORKING_HARD, EMOJI_THINKING, EMOJI_CAKE } from './utils/emoji';

const NODE_ENV: string = process.env.NODE_ENV as string;
dotenv.config({ path: `./.env.${NODE_ENV}` });

const client = new Discord.Client();
const parser = yargs
  .scriptName('[command-prefix]')
  .commandDir('commands/manage', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'production' ? 'js' : 'ts'] })
  .commandDir('commands/use', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'production' ? 'js' : 'ts'] })
  .strict()
  .help();

const SENTRY_DSN: string = process.env.SENTRY_DSN as string;
Sentry.init({ dsn: SENTRY_DSN });

interface WatchedMessage {
  message: Message;
  reactions: { [key: string]: () => void };
  userId: string;
}

const messagesToWatch: WatchedMessage[] = [];

client.on('ready', () => {
  client.user.setUsername('CAKE BOSS!');
  client.user.setActivity(`in the kitchen ${EMOJI_CAKE}`);

  console.log(EMOJI_CAKE);
});

const handleError = async (error: Error, message: Message) => {
  logError(client, message, error);

  message.channel.send('Uh oh, something broke!');

  if (NODE_ENV === 'production') {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
};

client.on('guildCreate', (guild: Guild) => {
  setupServer(guild.id);
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
  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (!server) {
    handleError(new Error('Could not find server.'), message);
    return;
  }

  const { commandPrefix, cakeNamePlural } = server.config;

  if (message.author.id !== client.user.id && cleanContent.startsWith(`${commandPrefix}`)) {
    try {
      // NOTE: I'm not entirely sure how or where to type these,
      // so putting this comment here to remind myself what is what.
      //
      // needsFetch:     boolean
      // promisedOutput: Promise<string> | null
      // reactions:      {[key: string]: () => void} | null
      parser.parse(
        cleanContent.replace(`${commandPrefix}`, ''),
        { client, message, needsFetch: false, promisedOutput: null, reactions: null },
        async (error, argv, output) => {
          if (error) {
            handleError(error, message);
          }

          let sentMessage: Message | null = null;

          if (argv.needsFetch) {
            sentMessage = (await message.channel.send(EMOJI_THINKING)) as Message;
          }

          if (argv.help) {
            const helpOutput = output
              .replace(/(\[command-prefix\] )/gm, commandPrefix)
              .replace(/cakes/gm, cakeNamePlural);

            message.channel.send(`${EMOJI_WORKING_HARD}\n\n\`\`\`\n${helpOutput}\n\`\`\``);
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

createConnection()
  .then(() => {
    const DISCORD_TOKEN: string = process.env.DISCORD_TOKEN as string;
    client.login(DISCORD_TOKEN);

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
