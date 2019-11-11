import { Argv } from "yargs";
import Table from "cli-table";
import Server from "../../entity/server";
import { EMOJI_WORKING_HARD } from "../../utils/emoji";
import getTableBorder from "../../utils/get-table-border";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";
import { handleError } from "../../utils/errors";

export const getTopGivers = async (args: CommandArguments): Promise<CommandResponse | void> => {
  try {
    const server = await Server.findOne({
      where: { discordId: args.message.guild.id }
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const members = await server.members;

    const sorted = members
      .concat()
      .sort((a, b) => b.given - a.given)
      .slice(0, 10)
      .filter(mem => mem.given > 0);

    if (sorted.length === 0) {
      return { content: `${EMOJI_WORKING_HARD} There are no top givers yet!` };
    }

    const table = new Table({
      head: ["", "Member", "Given"],
      style: { head: [], border: [] },
      chars: getTableBorder()
    });

    sorted.forEach((member, index) => {
      const discordMember = args.message.guild.members.get(member.discordId);
      table.push([`#${index + 1}`, discordMember ? discordMember.displayName : member.discordId, member.given]);
    });

    return {
      content: `${server.config.cakeEmoji} **Top Givers** \n\n\`\`\`\n\n${table.toString()}\n\`\`\``
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "givers";
export const describe = `View the server's top givers`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getTopGivers(args);
};
