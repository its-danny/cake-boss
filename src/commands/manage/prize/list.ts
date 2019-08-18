import { Argv } from 'yargs';
import Table from 'cli-table';
import { chain } from 'lodash';
import { toSentenceSerial } from 'underscore.string';
import { getConnection } from 'typeorm';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_PRIZE } from '../../../utils/emoji';
import getTableBorder from '../../../utils/get-table-border';
import { CommandArguments } from '../../../utils/command-arguments';
import Prize from '../../../entity/prize';

interface Arguments extends CommandArguments {
  page?: number;
}

export const getPrizeList = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (!server.config.redeemChannelId || server.config.redeemChannelId === '') {
    return `${EMOJI_ERROR} You need to set the \`redeem-channel\` config before using prizes.`;
  }

  const table = new Table({
    head: ['ID', 'Description', 'Reaction Emoji', 'Price', 'Role to Give'],
    style: { head: [], border: [] },
    chars: getTableBorder(),
  });

  const perPage = 5;
  const totalPages = Math.ceil((await Prize.count({ where: { server } })) / perPage);

  if (args.page && (!Number.isInteger(args.page) || args.page > totalPages)) {
    return `${EMOJI_ERROR} Invalid page number, sorry!`;
  }

  const currentPage = args.page ? args.page : 1;

  const connection = getConnection();
  const prizes: Prize[] = await connection
    .getRepository(Prize)
    .createQueryBuilder('prize')
    .where({ server })
    .orderBy('prize.id', 'ASC')
    .skip(perPage * (currentPage - 1))
    .take(perPage)
    .getMany();

  prizes.forEach(prize => {
    const roleNames = chain(prize.roleIds)
      .map(roleId => {
        const role = args.message.guild.roles.get(roleId);

        if (role) {
          return role.name;
        }

        return undefined;
      })
      .compact()
      .value();

    table.push([
      prize.id,
      prize.description,
      prize.reactionEmoji,
      prize.price,
      roleNames.length > 0 ? toSentenceSerial(roleNames) : 'none',
    ]);

    return false;
  });

  return `${EMOJI_PRIZE} **Prize List** [ Page ${currentPage} of ${totalPages} ]\n\n\`\`\`\n\n${table.toString()}\n\`\`\``;
};

export const command = 'list [page]';
export const describe = 'View prize list';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getPrizeList(args);
};
