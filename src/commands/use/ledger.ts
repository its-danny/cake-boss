import { Argv } from 'yargs';
import Table from 'cli-table';
import { Client, Message } from 'discord.js';
import moment from 'moment';
import Server from '../../entity/server';
import { canManage } from '../../utils/permissions';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const getLedger = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const table = new Table({
    head: ['Member', 'Balance', 'Earned', 'Date Added'],
    style: { head: [], border: [] },
  });

  await args.message.guild.fetchMembers();

  server.members.forEach(member => {
    const discordMember = args.message.guild.members.get(member.discordId);
    table.push([
      discordMember ? discordMember.displayName : member.discordId,
      member.balance,
      member.earned,
      moment(member.createdAt).format('MMMM Do YYYY'),
    ]);
  });

  return `${server.config.cakeEmoji} **Ledger** \n\n\`\`\`\n\n${table.toString()}\n\`\`\``;
};

export const command = 'ledger';
export const describe = 'View the ledger';

export const builder = (yargs: Argv) => yargs;

export const handler = async (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getLedger(args);
};
