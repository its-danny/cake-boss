import { Argv } from "yargs";

import Member from "../../../entity/member";
import Server from "../../../entity/server";
import { CommandArguments, CommandResponse } from "../../../utils/command-interfaces";
import {
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_JOB_WELL_DONE,
  EMOJI_RECORD_NOT_FOUND,
  EMOJI_SHAME,
} from "../../../utils/emoji";
import { handleError } from "../../../utils/errors";
import { logEvent } from "../../../utils/logger";
import { canManage } from "../../../utils/permissions";

export interface Arguments extends CommandArguments {
  member: string;
}

export const shameMember = async (args: Arguments): Promise<CommandResponse | void> => {
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

    const memberId = args.member.replace(/^<@!?/, "").replace(/>$/, "");
    const discordMember = args.message.guild.members.cache.get(memberId);

    if (!discordMember) {
      return {
        content: `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`,
      };
    }

    const member = await Member.findOne({
      where: { discordId: discordMember.id },
    });

    if (!member) {
      throw new Error("Could not find member.");
    }

    member.shamed = true;
    await member.save();

    logEvent(
      args.client,
      args.message,
      `${EMOJI_SHAME} \`${args.message.author.tag}\` added \`${discordMember.user.tag}\` to the shame list.`,
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

export const command = "add <member>";
export const describe = "Shame someone";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = shameMember(args);
};
