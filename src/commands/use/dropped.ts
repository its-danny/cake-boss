import Table from "cli-table";
import { Argv } from "yargs";

import Server from "../../entity/server";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_WORKING_HARD } from "../../utils/emoji";
import { handleError } from "../../utils/errors";
import getTableBorder from "../../utils/get-table-border";
import { canDrop } from "../../utils/permissions";

export const getDropList = async (args: CommandArguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canDrop(args.message))) {
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

    if (server.drops.length === 0) {
      return { content: `${EMOJI_WORKING_HARD} There are no drops yet!` };
    }

    const table = new Table({
      head: ["Channel", "Amount"],
      style: { head: [], border: [] },
      chars: getTableBorder(),
    });

    const dropped: { [key: string]: number } = {};

    server.drops.forEach(drop => {
      const channel = args.message.guild.channels.get(drop.channelDiscordId);

      if (channel) {
        if (Object.prototype.hasOwnProperty.call(dropped, channel.name)) {
          dropped[channel.name] += drop.amount;
        } else {
          dropped[channel.name] = drop.amount;
        }
      }
    });

    Object.keys(dropped)
      .sort((a, b) => dropped[b] - dropped[a])
      .forEach(channel => table.push([`#${channel}`, dropped[channel]]));

    return {
      content: `${server.config.cakeEmoji} **Dropped ${
        server.config.cakeNamePlural
      }** \n\n\`\`\`\n\n${table.toString()}\n\`\`\``,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "dropped";
export const describe = "View dropped cakes";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getDropList(args);
};
