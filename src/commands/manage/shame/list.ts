import { Argv } from 'yargs';
import Table from 'cli-table';
import moment from 'moment';
import { getConnection } from 'typeorm';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND, EMOJI_ERROR, EMOJI_SHAME } from '../../../utils/emoji';
import getTableBorder from '../../../utils/get-table-border';
import { CommandArguments } from '../../../utils/command-arguments';
import ShamedMember from '../../../entity/shamed-member';

interface Arguments extends CommandArguments {
  page?: number;
}

export const getShamedList = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const table = new Table({
    head: ['Name', 'Date Shamed'],
    style: { head: [], border: [] },
    chars: getTableBorder(),
  });

  const perPage = 5;
  const totalPages = Math.ceil((await ShamedMember.count({ where: { server } })) / perPage);

  if (args.page && (!Number.isInteger(args.page) || args.page > totalPages)) {
    return `${EMOJI_ERROR} Invalid page number, sorry!`;
  }

  const currentPage = args.page ? args.page : 1;

  const connection = getConnection();
  const shamedMembers: ShamedMember[] = await connection
    .getRepository(ShamedMember)
    .createQueryBuilder('shamed')
    .where({ server })
    .leftJoinAndSelect('shamed.member', 'member')
    .orderBy('shamed.id', 'ASC')
    .skip(perPage * (currentPage - 1))
    .take(perPage)
    .getMany();

  shamedMembers.forEach(shamed => {
    const discordMember = args.message.guild.members.get(shamed.member.discordId);

    if (!discordMember) {
      return `${EMOJI_RECORD_NOT_FOUND} Uh oh, had trouble finding a user.`;
    }

    table.push([discordMember.user.tag, moment(shamed.createdAt).format('MMMM Do YYYY')]);

    return false;
  });

  return `${EMOJI_SHAME} **Shame List** [ Page ${currentPage} of ${totalPages} ]\n\n\`\`\`\n\n${table.toString()}\n\`\`\``;
};

export const command = 'list [page]';
export const describe = 'List shamed users';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getShamedList(args);
};
