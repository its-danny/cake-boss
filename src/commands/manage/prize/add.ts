import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Prize from '../../../entity/prize';
import { logEvent } from '../../../utils/logger';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  description: string;
  reactionEmoji: string;
  price: number;
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const addPrize = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (server.config.redeemChannelId === '') {
    return `😨 You need to set the \`redeem-channel\` config before using prizes`;
  }

  if (args.description.trim() === '') {
    return '😨 Description required!';
  }

  if (args.reactionEmoji.trim() === '') {
    return '😨 Reaction emoji required!';
  }

  if (args.price <= 0) {
    return '😨 Price must be 1 or more!';
  }

  const prize = new Prize();
  prize.server = server;
  prize.description = args.description;
  prize.reactionEmoji = args.reactionEmoji;
  prize.price = args.price;
  await prize.save();

  logEvent(args.client, args.message, `🎁 \`@${args.message.author.tag}\` added a new prize! \`${prize.description}\``);

  return '😁 Done!';
};

export const command = 'add <description> <reactionEmoji> <price>';
export const describe = 'Add a prize';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = addPrize(args);
};
