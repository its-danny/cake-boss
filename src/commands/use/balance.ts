import { Argv } from "yargs";

import Member from "../../entity/member";
import Server from "../../entity/server";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";
import { handleError } from "../../utils/errors";

export interface Arguments extends CommandArguments {
  member?: string;
}

export const getBalance = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    let usingMember = false;
    let member: Member | undefined;

    if (args.member) {
      const receivingMemberId = args.member.replace(/^<@!?/, "").replace(/>$/, "");

      usingMember = true;
      member = await Member.findOne({
        where: { server, discordId: receivingMemberId },
      });
    } else {
      member = await Member.findOne({
        where: { server, discordId: args.message.member.id },
      });
    }

    if (!member) {
      throw new Error("Could not find member.");
    }

    return {
      content: `${server.config.cakeEmoji} ${usingMember ? "Their" : "Your"} current balance is ${member.balance} ${
        member.balance === 1 ? server.config.cakeNameSingular : server.config.cakeNamePlural
      }!`,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "balance [member]";
export const describe = "Check your or another member's cake balance";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getBalance(args);
};
