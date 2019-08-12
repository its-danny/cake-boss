import { Argv } from 'yargs';
import Table from 'cli-table';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';

interface Arguments {
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

  if (server) {
    const table = new Table({
      head: ['', 'Member', 'Earned'],
      style: { head: [], border: [] },
    });

    await args.message.guild.fetchMembers();

    const sorted = server.members
      .concat()
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 10);

    sorted.forEach((member, index) => {
      const discordMember = args.message.guild.members.get(member.discordId);
      table.push([`#${index + 1}`, discordMember ? discordMember.displayName : member.discordId, member.earned]);
    });

    return `${server.config.cakeEmoji} **Leaders!** \n\n\`\`\`\n\n${table.toString()}\n\`\`\``;
  }

  throw new Error('Could not find server.');
};

export const command = 'leaders';
export const describe = 'View the leaders';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getLeaderboard(args);
};
