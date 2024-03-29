import { Role } from "discord.js";
import { Argv } from "yargs";

import Member from "../../entity/member";
import Server from "../../entity/server";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";
import { EMOJI_DONT_DO_THAT, EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND } from "../../utils/emoji";
import { handleError } from "../../utils/errors";
import { logEvent, logMilestone } from "../../utils/logger";
import { canBless, isShamed } from "../../utils/permissions";

export interface Arguments extends CommandArguments {
  member: string;
  role: string;
  amount?: number;
}

export const blessMember = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canBless(args.message))) {
      return {
        content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`,
      };
    }

    if (!args.message.guild) {
      throw new Error("Could not find Discord Guild.");
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const receivingMemberId = args.member.replace(/^<@!?/, "").replace(/>$/, "");
    const receivingDiscordMember = args.message.guild.members.cache.get(receivingMemberId);

    if (!receivingDiscordMember) {
      return {
        content: `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`,
      };
    }

    if (await isShamed(server.discordId, receivingDiscordMember.id)) {
      return {
        content: `${EMOJI_DONT_DO_THAT} They have been **shamed** and can not get ${server.config.cakeNamePlural}!`,
      };
    }

    const receivingMember = await Member.findOne({
      where: { discordId: receivingDiscordMember.id },
    });

    if (!receivingMember) {
      throw new Error("Could not find member.");
    }

    let amount = args.amount ? args.amount : 1;

    if (!Number.isInteger(amount) || amount <= 0) {
      amount = 1;
    }

    const previousEarned = receivingMember.earned;
    receivingMember.earned += amount;
    receivingMember.balance += amount;

    await receivingMember.save();

    logEvent(
      args.client,
      args.message,
      `${server.config.cakeEmoji} \`${args.message.author.tag}\` blessed \`${
        receivingDiscordMember.user.tag
      }\` with ${amount} ${amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular}!`,
    );

    server.milestones.forEach((milestone) => {
      if (previousEarned < milestone.amount && receivingMember.earned >= milestone.amount) {
        const roles = milestone.roleIds
          .map((roleId) => args.message.guild!.roles.cache.find((role) => role.id === roleId))
          .filter((role): role is Role => !!role);

        receivingDiscordMember.roles.add(roles);

        logMilestone(args.client, args.message, milestone, receivingDiscordMember, roles);
      }
    });

    if (previousEarned < server.config.requirementToGive && receivingMember.earned >= server.config.requirementToGive) {
      args.message.channel.send(
        `${server.config.cakeEmoji} You can now give ${server.config.cakeNamePlural}, <@${receivingDiscordMember.id}>!`,
      );
    }

    if (server.config.quietMode) {
      let react: string;

      if (/\b:\d{18}/.test(server.config.cakeEmoji)) {
        [react] = server.config.cakeEmoji.match(/\d{18}/)!;
      } else {
        react = server.config.cakeEmoji;
      }

      args.message.react(react);

      return undefined;
    }

    if (!args.message.member) {
      throw new Error("Could not find Discord GuildMember.");
    }

    return {
      content: `${server.config.cakeEmoji} ${receivingDiscordMember.displayName} just got ${amount} ${
        amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
      }, <@${args.message.member.id}>!`,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const blessRole = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canBless(args.message))) {
      return {
        content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`,
      };
    }

    if (!args.message.guild) {
      throw new Error("Could not find Discord Guild.");
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const discordRole = args.message.guild.roles.cache.find((role) => role.name === args.role);

    if (!discordRole) {
      return {
        content: `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find that role.`,
      };
    }

    const amount = args.amount ? args.amount : 1;

    // eslint-disable-next-line no-restricted-syntax
    for (const discordMember of discordRole.members.values()) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await isShamed(server.discordId, discordMember.id))) {
        // eslint-disable-next-line no-await-in-loop
        const member = await Member.findOne({
          where: { discordId: discordMember.id },
        });

        if (member) {
          const previousEarned = member.earned;
          member.earned += amount;
          member.balance += amount;

          // eslint-disable-next-line no-await-in-loop
          await member.save();

          server.milestones.forEach((milestone) => {
            if (previousEarned < milestone.amount && member.earned >= milestone.amount) {
              const roles = milestone.roleIds
                .map((roleId) => args.message.guild!.roles.cache.find((role) => role.id === roleId))
                .filter((role): role is Role => !!role);

              discordMember.roles.add(roles);

              logMilestone(args.client, args.message, milestone, discordMember, roles);
            }
          });

          if (previousEarned < server.config.requirementToGive && member.earned >= server.config.requirementToGive) {
            args.message.channel.send(
              `${server.config.cakeEmoji} You can now give ${server.config.cakeNamePlural}, <@${discordMember.id}>!`,
            );
          }
        }
      }
    }

    logEvent(
      args.client,
      args.message,
      `${server.config.cakeEmoji} \`${args.message.author.tag}\` blessed the \`${
        discordRole.name
      }\` role with ${amount} ${amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular}!`,
    );

    if (server.config.quietMode) {
      let react: string;

      if (/\b:\d{18}/.test(server.config.cakeEmoji)) {
        [react] = server.config.cakeEmoji.match(/\d{18}/)!;
      } else {
        react = server.config.cakeEmoji;
      }

      args.message.react(react);

      return undefined;
    }

    if (!args.message.member) {
      throw new Error("Could not find Discord GuildMember.");
    }

    return {
      content: `${server.config.cakeEmoji} They all just got ${amount} ${
        amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
      }, <@${args.message.member.id}>!`,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "bless <member|role> [amount]";
export const describe = "Bless them with cakes";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;

  if (/^<@(!?)(\d*)>/.test(args.member)) {
    args.promisedOutput = blessMember(args);
  } else {
    args.promisedOutput = blessRole(args);
  }
};
