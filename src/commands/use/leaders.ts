import { Argv } from 'yargs';
import Table from 'cli-table';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';
import { EMOJI_WORKING_HARD } from '../../utils/emoji';
import { getTableBorder } from '../../utils/ascii';

export interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const getLeaderboard = async (args: Arguments): Promise<string> => {
  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const sorted = server.members
    .concat()
    .sort((a, b) => b.earned - a.earned)
    .slice(0, 10);

  if (sorted.length === 0) {
    return `${EMOJI_WORKING_HARD} There are no leaders yet!`;
  }

  const table = new Table({
    head: ['', 'Member', 'Earned'],
    style: { head: [], border: [] },
    chars: getTableBorder(),
  });

  sorted.forEach((member, index) => {
    const discordMember = args.message.guild.members.get(member.discordId);
    table.push([`#${index + 1}`, discordMember ? discordMember.displayName : member.discordId, member.earned]);
  });

  return `${server.config.cakeEmoji} **Leaders!** \n\n\`\`\`\n\n${table.toString()}\n\`\`\``;
};

export const command = 'leaders';
export const describe = 'View the server leaderboard';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getLeaderboard(args);
};
