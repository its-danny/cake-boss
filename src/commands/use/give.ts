import moment from "moment";
import { Argv } from "yargs";

import Member from "../../entity/member";
import Server from "../../entity/server";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";
import {
  EMOJI_DONT_DO_THAT,
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_RECORD_NOT_FOUND,
  EMOJI_WORKING_HARD,
} from "../../utils/emoji";
import { handleError } from "../../utils/errors";
import { logEvent, logMilestone } from "../../utils/logger";
import { canGive, isShamed } from "../../utils/permissions";

export interface Arguments extends CommandArguments {
  member: string;
  amount?: number;
}

export const giveCakeToMember = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    if (server.config.noGiving) {
      return {
        content: `${EMOJI_WORKING_HARD} You can't give ${server.config.cakeNamePlural}!`,
      };
    }

    if (await isShamed(args.message.guild.id, args.message.member.id)) {
      return {
        content: `${EMOJI_DONT_DO_THAT} You have been **shamed** and can not give ${server.config.cakeNamePlural}!`,
      };
    }

    const receivingMemberId = args.member.replace(/^<@!?/, "").replace(/>$/, "");
    const receivingDiscordMember = args.message.guild.members.get(receivingMemberId);

    if (!receivingDiscordMember) {
      return {
        content: `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`,
      };
    }

    if (receivingDiscordMember.id === args.message.member.id) {
      return { content: `${EMOJI_DONT_DO_THAT} Don't be greedy!` };
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

    const givingMember = await Member.findOne({
      where: { discordId: args.message.member.id },
    });

    if (!givingMember) {
      throw new Error("Could not find member.");
    }

    if (!(await canGive(args.message))) {
      if (givingMember.earned < server.config.requirementToGive) {
        return {
          content: `${EMOJI_INCORRECT_PERMISSIONS} You need to earn ${server.config.requirementToGive} ${server.config.cakeNamePlural} first!`,
        };
      }
      if (givingMember.givenSinceReset >= server.config.giveLimit) {
        const remaining = server.config.giveLimitHourReset - server.timeSinceLastReset;
        const date = moment().add(remaining, "hours");

        return {
          content: `${EMOJI_INCORRECT_PERMISSIONS} You're out of ${
            server.config.cakeNamePlural
          }! You can give more ${date.fromNow()}.`,
        };
      }
      return {
        content: `${EMOJI_INCORRECT_PERMISSIONS} You can't do that yet!`,
      };
    }

    let amount = args.amount ? args.amount : 1;

    if (!Number.isInteger(amount) || amount <= 0) {
      amount = 1;
    }

    if (amount > server.config.giveLimit) {
      amount = server.config.giveLimit;
    }

    if (amount > server.config.giveLimit - givingMember.givenSinceReset) {
      amount -= server.config.giveLimit - givingMember.givenSinceReset;
    }

    const previousEarned = receivingMember.earned;
    receivingMember.earned += amount;
    receivingMember.balance += amount;

    await receivingMember.save();

    givingMember.given += amount;
    givingMember.givenSinceReset += amount;

    await givingMember.save();

    logEvent(
      args.client,
      args.message,
      `${server.config.cakeEmoji}  \`${args.message.author.tag}\` gave \`${
        receivingDiscordMember.user.tag
      }\` ${amount} ${amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular}!`,
    );

    server.milestones.forEach(milestone => {
      if (previousEarned < milestone.amount && receivingMember.earned >= milestone.amount) {
        const roles = milestone.roleIds.map(roleId => args.message.guild.roles.find(role => role.id === roleId));
        receivingDiscordMember.addRoles(roles);

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

    return {
      content: `${server.config.cakeEmoji} ${receivingDiscordMember.displayName} just got ${amount} ${
        amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
      }, <@${args.message.member.id}>!`,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "give <member> [amount]";
export const describe = "Give someone cake!";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = giveCakeToMember(args);
};
