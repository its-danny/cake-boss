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

client.on('ready', () => {
  client.user.setUsername('CAKE BOSS!');
  client.user.setActivity('in the kitchen 🍰');

  console.log('🍰');
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

client.on('message', async (message: Message) => {
  const cleanContent = message.content.trim().toLowerCase();
  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (!server) {
    handleError(new Error('Could not find server.'), message);
    return;
  }

  const { commandPrefix, cakeNamePlural } = server.config;

  if (message.author.id !== client.user.id && cleanContent.startsWith(`${commandPrefix}`)) {
    try {
      parser.parse(
        cleanContent.replace(`${commandPrefix}`, ''),
        { client, message, needsFetch: false, promisedOutput: null },
        async (error, argv, output) => {
          if (error) {
            handleError(error, message);
          }

          let tempMessage: Message | null = null;

          if (argv.needsFetch) {
            tempMessage = (await message.channel.send('🤔')) as Message;
          }

          if (argv.help) {
            const helpOutput = output
              .replace(/(\[command-prefix\] )/gm, commandPrefix)
              .replace(/cakes/gm, cakeNamePlural);

            message.channel.send(`😅\n\n\`\`\`\n${helpOutput}\n\`\`\``);
          } else if (argv.promisedOutput) {
            let commandOutput: string[] | string = (await argv.promisedOutput) as string[] | string;

            if (!Array.isArray(commandOutput)) {
              commandOutput = [commandOutput];
            }

            commandOutput.forEach((out, i) => {
              if (tempMessage && i === 0) {
                tempMessage.edit(out);
              } else {
                message.channel.send(out);
              }
            });
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
