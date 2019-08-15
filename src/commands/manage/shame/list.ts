import { Argv } from 'yargs';
import Table from 'cli-table';
import moment from 'moment';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND } from '../../../utils/emoji';
import { getTableBorder } from '../../../utils/ascii';
import { CommandArguments } from '../../../utils/command-arguments';

export const getShamedList = async (args: CommandArguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
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
    chars: getTableBorder(),
  });

  server.shamed.forEach(shamed => {
    const discordMember = args.message.guild.members.get(shamed.member.discordId);

    if (!discordMember) {
      return `${EMOJI_RECORD_NOT_FOUND} Uh oh, had trouble finding a user.`;
    }

    table.push([discordMember.user.tag, moment(shamed.createdAt).format('MMMM Do YYYY')]);

    return false;
  });

  return `\n\`\`\`\n${table.toString()}\n\`\`\``;
};

export const command = 'list';
export const describe = 'List shamed users';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getShamedList(args);
};
