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
  id: number;
  description: string;
  reactionEmoji: string;
  price: number;
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const editPrize = async (args: Arguments): Promise<string> => {
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

  const prize = await Prize.findOne({ server, id: args.id });

  if (!prize) {
    return `😨 Couldn't find that prize, are you sure \`${args.id}\` is the right ID?`;
  }

  prize.description = args.description;
  prize.reactionEmoji = args.reactionEmoji;
  prize.price = args.price;
  await prize.save();

  logEvent(args.client, args.message, `🎁 \`@${args.message.author.tag}\` edited prize! \`${prize.description}\``);

  return '😁 Done!';
};

export const command = 'edit <id> <description> <reactionEmoji> <price>';
export const describe = 'Edit a prize';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = editPrize(args);
};
