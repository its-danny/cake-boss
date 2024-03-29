import { Role } from "discord.js";
import { Argv } from "yargs";

import Milestone from "../../../entity/milestone";
import Server from "../../../entity/server";
import { CommandArguments, CommandResponse } from "../../../utils/command-interfaces";
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE, EMOJI_MILESTONE } from "../../../utils/emoji";
import { handleError } from "../../../utils/errors";
import { logEvent } from "../../../utils/logger";
import { canManage } from "../../../utils/permissions";

export interface Arguments extends CommandArguments {
  amount: number;
  roles: string;
  announcement?: string;
}

export const addMilestone = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
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

    if (args.amount <= 0) {
      return { content: `${EMOJI_ERROR} Amount must be 1 or more!` };
    }

    const milestone = new Milestone();
    milestone.server = server;
    milestone.amount = args.amount;

    if (args.roles === "none") {
      milestone.roleIds = [];
    } else {
      const foundRolesIds = args.roles
        .split(",")
        .map((g) => g.trim())
        .filter((roleName) => {
          return args.message.guild!.roles.cache.find((role) => role.name === roleName.trim());
        })
        .map((roleName) => args.message.guild!.roles.cache.find((role) => role.name === roleName.trim()))
        .filter((role): role is Role => !!role)
        .map((role) => role.id);

      if (foundRolesIds.length > 0) {
        milestone.roleIds = foundRolesIds;
      } else {
        return { content: `${EMOJI_ERROR} Must give 1 or more valid roles!` };
      }
    }

    if (args.announcement) {
      milestone.announcement = args.announcement;
    }

    await milestone.save();

    logEvent(
      args.client,
      args.message,
      `${EMOJI_MILESTONE} \`${args.message.author.tag}\` added a new milestone: \`${milestone.amount}\``,
    );

    if (server.config.quietMode) {
      args.message.react(EMOJI_JOB_WELL_DONE);

      return undefined;
    }
    return { content: `${EMOJI_JOB_WELL_DONE} Done!` };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "add <amount> <roles> [announcement]";
export const describe = "Add a milestone";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = addMilestone(args);
};
