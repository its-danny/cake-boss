import { RichEmbed } from "discord.js";
import { humanize } from "underscore.string";
import { Argv } from "yargs";

import Member from "../../entity/member";
import Server from "../../entity/server";
import { CommandArguments } from "../../utils/command-interfaces";
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND } from "../../utils/emoji";
import { handleError } from "../../utils/errors";
import { canManage } from "../../utils/permissions";

interface Arguments extends CommandArguments {
  member: string;
}

const getUserStats = async (args: Arguments): Promise<string | void> => {
  try {
    if (!(await canManage(args.message))) {
      return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const memberId = args.member.replace(/^<@!?/, "").replace(/>$/, "");
    const discordMember = args.message.guild.members.get(memberId);

    if (!discordMember) {
      return `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`;
    }

    const member = await Member.findOrCreate(args.message.guild.id, discordMember.user.id, discordMember.id);

    if (member) {
      const reset = server.config.giveLimitHourReset;

      const embed = new RichEmbed()
        .setColor("#0099ff")
        .setAuthor(discordMember.displayName, discordMember.user.avatarURL)
        .setDescription(`${humanize(server.config.cakeNameSingular)} stats for ${discordMember.user.tag}`)
        .setThumbnail(discordMember.user.avatarURL)
        .addField("Balance", member.balance, true)
        .addField("Earned", member.earned, true)
        .addField("Given", member.given, true)
        .addField(`Given Since Reset (${reset} ${reset === 1 ? "hour" : "hoursn"})`, member.givenSinceReset, true)
        .addField("Shamed", member.shamed);

      args.message.channel.send(embed);
    }

    return undefined;
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "stats <member>";
export const describe = `Get stats on a user`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  getUserStats(args);
};
