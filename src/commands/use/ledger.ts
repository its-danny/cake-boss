import { Argv } from 'yargs';
import Table from 'cli-table';
import { Client, Message } from 'discord.js';
import moment from 'moment';
import Server from '../../entity/server';
import { canManage } from '../../utils/permissions';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_WORKING_HARD } from '../../utils/emoji';
import { getTableBorder } from '../../utils/ascii';
import { CommandArguments } from '../../utils/command-arguments';

export const getLedger = async (args: CommandArguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (server.members.length === 0) {
    return `${EMOJI_WORKING_HARD} Nobody has ${server.config.cakeNamePlural} yet!`;
  }

  const table = new Table({
    head: ['Member', 'Balance', 'Earned', 'Date Added'],
    style: { head: [], border: [] },
    chars: getTableBorder(),
  });

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

export const handler = async (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getLedger(args);
};
