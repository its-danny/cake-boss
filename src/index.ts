import "reflect-metadata";
import dotenv from "dotenv";
import Discord, { Message, Guild, TextChannel } from "discord.js";
import * as Sentry from "@sentry/node";
import yargs from "yargs";
import { createConnection } from "typeorm";
import moment from "moment";
import fs from "fs";
import fsExtra from "fs-extra";
import schedule from "node-schedule";
import Koa from "koa";
import Router from "koa-router";
import cors from "@koa/cors";
import Axios from "axios";
import Member from "./entity/member";
import Server from "./entity/server";
import User from "./entity/user";
import { CommandArguments, CommandResponse } from "./utils/command-interfaces";
import { EMOJI_JOB_WELL_DONE, EMOJI_WORKING_HARD, EMOJI_THINKING, EMOJI_CAKE } from "./utils/emoji";
import { handleError } from "./utils/errors";

dotenv.config({ path: `./.env` });

// Sentry

const SENTRY_DSN: string = process.env.SENTRY_DSN as string;
const SENTRY_DISABLED = !SENTRY_DSN || SENTRY_DSN === "";

if (!SENTRY_DISABLED) {
  Sentry.init({ dsn: SENTRY_DSN });
}

// Bot

const client = new Discord.Client({
  fetchAllMembers: true
});

const NODE_ENV: string = process.env.NODE_ENV as string;

const commandParser = yargs
  .scriptName("[command-prefix]")
  .commandDir("commands/manage", {
    exclude: /\.test\./gm,
    extensions: [NODE_ENV === "production" ? "js" : "ts"]
  })
  .commandDir("commands/use", {
    exclude: /\.test\./gm,
    extensions: [NODE_ENV === "production" ? "js" : "ts"]
  })
  .showHelpOnFail(true)
  .wrap(null)
  .help();

interface WatchedMessage {
  message: Message;
  reactions: { [key: string]: () => void };
  userId: string;
}

const messagesToWatch: WatchedMessage[] = [];

client.on("ready", async () => {
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

client.on("guildCreate", async (guild: Guild) => {
  await Server.findOrCreate(guild.id);
});

client.on("guildDelete", async (guild: Guild) => {
  const server = await Server.findOne({ where: { discordId: guild.id } });

  if (server) {
    server.active = false;
    await server.save();
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  const index = messagesToWatch.findIndex(m => m.message.id === reaction.message.id);

  if (index > -1) {
    const message = messagesToWatch[index];

    if (user.id === message.userId && Object.hasOwnProperty.call(message.reactions, reaction.emoji.toString())) {
      message.reactions[reaction.emoji.toString()]();
      message.message.edit(`${EMOJI_JOB_WELL_DONE} Prize redeemed!`);
      messagesToWatch.splice(index, 1);

      const server = await Server.findOne({
        where: { discordId: message.message.guild.id }
      });

      if (server && server.config.redeemChannelId && server.config.redeemPingRoleIds.length > 0) {
        const discordChannel = message.message.guild.channels.get(server.config.redeemChannelId) as TextChannel;

        if (discordChannel) {
          const mentions = server.config.redeemPingRoleIds.map(id => `<@&${id}>`);
          discordChannel.send(`👇 A prize was redeemed, ${mentions.join(" ")}!`);
        }
      }
    }
  }
});

client.on("message", async (message: Message) => {
  if (message.author.id !== client.user.id && !message.author.bot) {
    const server = await Server.findOrCreate(message.guild.id);

    if (server) {
      const { commandPrefix } = server.config;

      const cleanContent = message.content
        .trim()
        .split(" ")
        .map((s, i) => (i === 0 ? s.toLowerCase() : s))
        .join(" ");

      if (cleanContent.startsWith(`${commandPrefix}`) || message.isMemberMentioned(client.user)) {
        try {
          await Member.findOrCreate(server.discordId, message.author.id, message.member.id);

          // eslint-disable-next-line no-restricted-syntax
          for (const member of message.mentions.members) {
            // eslint-disable-next-line no-await-in-loop
            if ((await Member.count({ where: { discordId: member[1].id } })) === 0) {
              // eslint-disable-next-line no-await-in-loop
              await Member.findOrCreate(server.discordId, member[1].user.id, member[1].id);
            }
          }

          const context: CommandArguments = {
            client,
            message,
            deleteCaller: false,
            needsFetch: false,
            careAboutQuietMode: false,
            promisedOutput: null,
            reactions: null
          };

          let command = cleanContent.replace(commandPrefix, "");

          if (message.isMemberMentioned(client.user) && message.mentions.members.get(client.user.id)) {
            const mentionRegex = new RegExp(`<@!?${message.mentions.members.get(client.user.id)!.id}>`);
            command = command.replace(mentionRegex, "");
          }

          commandParser.parse(command, context, async (error, argv) => {
            if (error) {
              if (error.name === "YError") {
                message.channel.send(
                  `\u200B${EMOJI_WORKING_HARD} Looks like you need some help! Check the commands here: <https://cake-boss.js.org/>`
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
                `\u200B${EMOJI_WORKING_HARD} Looks like you need some help! Check the commands here: <https://cake-boss.js.org/>`
              );
            }

            if (argv.promisedOutput) {
              const commandResponse: CommandResponse = (await argv.promisedOutput) as CommandResponse;

              if (sentMessage) {
                await sentMessage.edit(
                  `\u200B${commandResponse.content}`,
                  commandResponse.messageOptions || commandResponse.richEmbed
                );
              } else {
                sentMessage = (await message.channel.send(
                  `\u200B${commandResponse.content}`,
                  commandResponse.messageOptions || commandResponse.richEmbed || commandResponse.attachment
                )) as Message;
              }

              const reactions = argv.reactions as {
                [key: string]: () => void;
              } | null;

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

                const toWatch = {
                  message: sentMessage,
                  reactions,
                  userId: message.author.id
                };
                messagesToWatch.push(toWatch);
                const toWatchIndex = messagesToWatch.indexOf(toWatch);
                sentMessage
                  .delete(1000 * server.config.redeemTimer)
                  .then(() => messagesToWatch.splice(toWatchIndex, 1));
              }
            }
          });
        } catch (error) {
          handleError(error, message);
        }
      }
    }
  }
});

// API

const api = new Koa();
const router = new Router();

api.use(cors());
api.use(router.routes());
api.use(router.allowedMethods());

router.get("/ping", context => {
  // eslint-disable-next-line no-param-reassign
  context.body = "ONLINE";
});

// Start it all up

createConnection()
  .then(() => {
    const DISCORD_TOKEN: string = process.env.DISCORD_TOKEN as string;
    client.login(DISCORD_TOKEN);

    const API_PORT: string = process.env.API_PORT as string;

    if (API_PORT && API_PORT !== "") {
      api.listen(API_PORT, () => console.log("🚀 API online!"));
    }

    fs.writeFileSync(`${process.cwd()}/.uptime`, moment().utc(), "utf8");

    schedule.scheduleJob("0 * * * *", async () => {
      try {
        const servers = await Server.find({ where: { active: true } });

        servers.forEach(async server => {
          // eslint-disable-next-line no-param-reassign
          server.timeSinceLastReset += 1;

          if (server.timeSinceLastReset >= server.config.giveLimitHourReset) {
            // eslint-disable-next-line no-param-reassign
            server.timeSinceLastReset = 0;

            const members = await server.members;
            members.forEach(async member => {
              // eslint-disable-next-line no-param-reassign
              member.givenSinceReset = 0;
              await member.save();
            });
          }

          await server.save();
        });
      } catch (error) {
        handleError(error, null);
      }
    });

    schedule.scheduleJob("*/10 * * * *", async () => {
      try {
        await fsExtra.emptyDir(`${process.cwd()}/tmp/`);
      } catch (error) {
        handleError(error, null);
      }
    });

    schedule.scheduleJob("0 * * * *", async () => {
      const SUPPORT_SERVER_ID: string = process.env.SUPPORT_SERVER_ID as string;
      const SUPPORT_CHANNEL_ID: string = process.env.SUPPORT_CHANNEL_ID as string;

      if (SUPPORT_SERVER_ID && SUPPORT_CHANNEL_ID) {
        try {
          const supportGuild = client.guilds.find(guild => guild.id === SUPPORT_SERVER_ID);

          if (supportGuild) {
            const supportChannel = supportGuild.channels.find(guild => guild.id === SUPPORT_CHANNEL_ID);

            if (supportChannel) {
              const servers = await Server.find();
              const userCount = await User.count();
              const cakeTotalsByServer = Promise.all(servers.map(s => s.totalEarnedByMembers()));
              const cakeTotalsCombined = (await cakeTotalsByServer).reduce((a, b) => a + b);

              await supportChannel.setTopic(
                `${EMOJI_WORKING_HARD} ${servers.length} servers, ${userCount} users, ${cakeTotalsCombined} cakes given!`
              );

              const BOTS_ON_DISCORD_API_KEY: string = process.env.BOTS_ON_DISCORD_API_KEY as string;

              if (BOTS_ON_DISCORD_API_KEY) {
                await Axios.post(
                  `https://bots.ondiscord.xyz/bot-api/bots/611013950942871562/guilds`,
                  {
                    guildCount: servers.length
                  },
                  {
                    headers: {
                      Authorization: BOTS_ON_DISCORD_API_KEY
                    }
                  }
                );
              }

              const TOP_GG_API_KEY: string = process.env.TOP_GG_API_KEY as string;

              if (TOP_GG_API_KEY) {
                await Axios.post(
                  `https://top.gg/api/bots/611013950942871562/stats`,
                  {
                    server_count: servers.length
                  },
                  {
                    headers: {
                      Authorization: process.env.TOP_GG_API_KEY
                    }
                  }
                );
              }
            }
          }
        } catch (error) {
          handleError(error, null);
        }
      }
    });
  })
  .catch(error => {
    handleError(error, null);
  });
