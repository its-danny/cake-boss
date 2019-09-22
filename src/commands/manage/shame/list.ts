import { Argv } from 'yargs';
import Table from 'cli-table';
import { getConnection } from 'typeorm';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import {
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_RECORD_NOT_FOUND,
  EMOJI_ERROR,
  EMOJI_SHAME,
  EMOJI_WORKING_HARD,
} from '../../../utils/emoji';
import getTableBorder from '../../../utils/get-table-border';
import { CommandArguments, CommandResponse } from '../../../utils/command-interfaces';
import Member from '../../../entity/member';
import { handleError } from '../../../utils/errors';

interface Arguments extends CommandArguments {
  page?: number;
}

export const getShamedList = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return { content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!` };
    }

    const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

    if (!server) {
      throw new Error('Could not find server.');
    }

    const perPage = 5;
    const totalPages = Math.ceil((await Member.count({ where: { server, shamed: true } })) / perPage);

    if (args.page && (!Number.isInteger(args.page) || args.page > totalPages)) {
      return { content: `${EMOJI_ERROR} Invalid page number, sorry!` };
    }

    const currentPage = args.page ? args.page : 1;

    const connection = getConnection();
    const shamedMembers: Member[] = await connection
      .getRepository(Member)
      .createQueryBuilder('member')
      .where({ server, shamed: true })
      .orderBy('member.id', 'ASC')
      .skip(perPage * (currentPage - 1))
      .take(perPage)
      .getMany();

    if (shamedMembers.length === 0) {
      return { content: `${EMOJI_WORKING_HARD} There are no shamed users!` };
    }

    const table = new Table({
      head: ['Name'],
      style: { head: [], border: [] },
      chars: getTableBorder(),
    });

    shamedMembers.forEach(shamed => {
      const discordMember = args.message.guild.members.get(shamed.discordId);

      if (!discordMember) {
        return `${EMOJI_RECORD_NOT_FOUND} Uh oh, had trouble finding a user.`;
      }

      table.push([discordMember.user.tag]);

      return false;
    });

    return {
      content: `${EMOJI_SHAME} **Shame List** [ Page ${currentPage} of ${totalPages} ]\n\n\`\`\`\n\n${table.toString()}\n\`\`\``,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = 'list [page]';
export const describe = 'List shamed users';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getShamedList(args);
};
