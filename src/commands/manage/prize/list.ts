import { Argv } from 'yargs';
import Table from 'cli-table';
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
    let roleColumn = '';

    if (prize.roleId) {
      const role = args.message.guild.roles.find(r => r.id === prize.roleId);

      if (role) {
        roleColumn = role.name;
      }
    }

    table.push([prize.id, prize.description, prize.reactionEmoji, prize.price, roleColumn]);

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
