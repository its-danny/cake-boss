import { Argv } from "yargs";

import Prize from "../../../entity/prize";
import Server from "../../../entity/server";
import { CommandArguments, CommandResponse } from "../../../utils/command-interfaces";
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE, EMOJI_PRIZE } from "../../../utils/emoji";
import { handleError } from "../../../utils/errors";
import { logEvent } from "../../../utils/logger";
import { canManage } from "../../../utils/permissions";

export interface Arguments extends CommandArguments {
  id: number;
}

export const removePrize = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return {
        content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`,
      };
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    if (!server.config.redeemChannelId || server.config.redeemChannelId === "") {
      return {
        content: `${EMOJI_ERROR} You need to set the \`redeem-channel\` config before using prizes.`,
      };
    }

    const prize = await Prize.findOne({ server, id: args.id });

    if (!prize) {
      return {
        content: `${EMOJI_ERROR} Couldn't find that prize, are you sure \`${args.id}\` is the right ID?`,
      };
    }

    await prize.remove();

    logEvent(
      args.client,
      args.message,
      `${EMOJI_PRIZE} \`${args.message.author.tag}\` removed a prize: \`${prize.description}\``,
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
export const describe = "Remove a prize";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = removePrize(args);
};
