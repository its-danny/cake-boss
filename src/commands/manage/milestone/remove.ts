import { Argv } from "yargs";
import { canManage } from "../../../utils/permissions";
import Server from "../../../entity/server";
import Milestone from "../../../entity/milestone";
import { logEvent } from "../../../utils/logger";
import { CommandArguments, CommandResponse } from "../../../utils/command-interfaces";
import { EMOJI_ERROR, EMOJI_JOB_WELL_DONE, EMOJI_INCORRECT_PERMISSIONS, EMOJI_MILESTONE } from "../../../utils/emoji";
import { handleError } from "../../../utils/errors";

export interface Arguments extends CommandArguments {
  id: number;
}

export const removeMilestone = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return {
        content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`
      };
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id }
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const milestone = await Milestone.findOne({ server, id: args.id });

    if (!milestone) {
      return {
        content: `${EMOJI_ERROR} Couldn't find that milestone, are you sure \`${args.id}\` is the right ID?`
      };
    }

    await milestone.remove();

    logEvent(
      args.client,
      args.message,
      `${EMOJI_MILESTONE} \`${args.message.author.tag}\` removed a milestone: \`${milestone.amount}\``
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

export const command = "remove <id>";
export const describe = "Remove a milestone";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = removeMilestone(args);
};
