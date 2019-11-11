import { Argv } from "yargs";
import { canManage } from "../../../utils/permissions";
import Server from "../../../entity/server";
import Prize from "../../../entity/prize";
import { logEvent } from "../../../utils/logger";
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE, EMOJI_PRIZE } from "../../../utils/emoji";
import { CommandArguments, CommandResponse } from "../../../utils/command-interfaces";
import { handleError } from "../../../utils/errors";

export interface Arguments extends CommandArguments {
  description: string;
  reactionEmoji: string;
  price: number;
  roles?: string;
}

export const addPrize = async (args: Arguments): Promise<CommandResponse | void> => {
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

    if (!server.config.redeemChannelId || server.config.redeemChannelId === "") {
      return {
        content: `${EMOJI_ERROR} You need to set the \`redeem-channel\` config before using prizes.`
      };
    }

    if (args.description === "") {
      return { content: `${EMOJI_ERROR} Description required!` };
    }

    if (args.reactionEmoji === "") {
      return { content: `${EMOJI_ERROR} Reaction emoji required!` };
    }

    if (args.price <= 0) {
      return { content: `${EMOJI_ERROR} Price must be 1 or more!` };
    }

    const prize = new Prize();
    prize.server = server;
    prize.description = args.description;
    prize.reactionEmoji = args.reactionEmoji;
    prize.price = args.price;

    if (args.roles) {
      if (args.roles === "none") {
        prize.roleIds = [];
      } else {
        const foundRolesIds = args.roles
          .split(",")
          .map(g => g.trim())
          .filter(roleName => {
            return args.message.guild.roles.find(role => role.name === roleName.trim());
          })
          .map(roleName => args.message.guild.roles.find(role => role.name === roleName.trim()).id);

        if (foundRolesIds.length > 0) {
          prize.roleIds = foundRolesIds;
        }
      }
    }

    await prize.save();

    logEvent(
      args.client,
      args.message,
      `${EMOJI_PRIZE} \`${args.message.author.tag}\` added a new prize: \`${prize.description}\``
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

export const command = "add <description> <reactionEmoji> <price> [roles]";
export const describe = "Add a prize";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = addPrize(args);
};
