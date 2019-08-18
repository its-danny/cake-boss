import { Argv } from 'yargs';
import Table from 'cli-table';
import { chain } from 'lodash';
import { toSentenceSerial } from 'underscore.string';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS } from '../../../utils/emoji';
import getTableBorder from '../../../utils/get-table-border';
import { CommandArguments } from '../../../utils/command-arguments';

export const getPrizeList = async (args: CommandArguments): Promise<string> => {
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

  server.prizes.forEach(prize => {
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

  return `\n\`\`\`\n${table.toString()}\n\`\`\``;
};

export const command = 'list';
export const describe = 'View prize list';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getPrizeList(args);
};
