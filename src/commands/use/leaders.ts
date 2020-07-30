import Table from "cli-table";
import { Argv } from "yargs";

import Server from "../../entity/server";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";
import { EMOJI_WORKING_HARD } from "../../utils/emoji";
import { handleError } from "../../utils/errors";
import getTableBorder from "../../utils/get-table-border";

export const getTopEarners = async (args: CommandArguments): Promise<CommandResponse | void> => {
  try {
    if (!args.message.guild) {
      throw new Error("Could not find Discord Guild.");
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const members = await server.members;

    const sorted = members
      .concat()
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 10)
      .filter((mem) => mem.earned > 0);

    if (sorted.length === 0) {
      return { content: `${EMOJI_WORKING_HARD} There are no top earners yet!` };
    }

    const table = new Table({
      head: ["", "Member", "Earned"],
      style: { head: [], border: [] },
      chars: getTableBorder(),
    });

    sorted.forEach((member, index) => {
      const discordMember = args.message.guild!.members.cache.get(member.discordId);
      table.push([`#${index + 1}`, discordMember ? discordMember.displayName : member.discordId, member.earned]);
    });

    return {
      content: `${server.config.cakeEmoji} **Top Earners** \n\n\`\`\`\n\n${table.toString()}\n\`\`\``,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "leaders";
export const describe = `View the server's top earners`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getTopEarners(args);
};
