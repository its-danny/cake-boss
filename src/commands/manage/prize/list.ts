import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Table from 'cli-table';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import { EMOJI_VALIDATION_ERROR, EMOJI_INCORRECT_PERMISSIONS } from '../../../utils/emoji';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const getPrizeList = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'prizes'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (server.config.redeemChannelId === '') {
    return `${EMOJI_VALIDATION_ERROR} You need to set the \`redeem-channel\` config before using prizes`;
  }

  const table = new Table({
    head: ['ID', 'Description', 'Reaction Emoji', 'Price', 'Role to Give'],
    style: { head: [], border: [] },
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

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getPrizeList(args);
};