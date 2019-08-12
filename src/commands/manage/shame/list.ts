import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Table from 'cli-table';
import moment from 'moment';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const getShamedList = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['shamed', 'shamed.member'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const table = new Table({
    head: ['Name', 'Date Shamed'],
    style: { head: [], border: [] },
  });

  await args.message.guild.fetchMembers();

  server.shamed.forEach(shamed => {
    const discordMember = args.message.guild.members.get(shamed.member.discordId);

    if (!discordMember) {
      return `😢 Uh oh, had trouble finding a user.`;
    }

    table.push([discordMember.user.tag, moment(shamed.createdAt).format('MMMM Do YYYY')]);

    return false;
  });

  return `\n\`\`\`\n${table.toString()}\n\`\`\``;
};

export const command = 'list';
export const describe = 'List shamed users';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getShamedList(args);
};
