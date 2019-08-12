import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Prize from '../../../entity/prize';
import { logEvent } from '../../../utils/logger';
import {
  EMOJI_VALIDATION_ERROR,
  EMOJI_PRIZE_EVENT,
  EMOJI_JOB_WELL_DONE,
  EMOJI_INCORRECT_PERMISSIONS,
} from '../../../utils/emoji';

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
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (server.config.redeemChannelId === '') {
    return `${EMOJI_VALIDATION_ERROR} You need to set the \`redeem-channel\` config before using prizes`;
  }

  if (args.description.trim() === '') {
    return `${EMOJI_VALIDATION_ERROR} Description required!`;
  }

  if (args.reactionEmoji.trim() === '') {
    return `${EMOJI_VALIDATION_ERROR} Reaction emoji required!`;
  }

  if (args.price <= 0) {
    return `${EMOJI_VALIDATION_ERROR} Price must be 1 or more!`;
  }

  const prize = await Prize.findOne({ server, id: args.id });

  if (!prize) {
    return `${EMOJI_VALIDATION_ERROR} Couldn't find that prize, are you sure \`${args.id}\` is the right ID?`;
  }

  prize.description = args.description;
  prize.reactionEmoji = args.reactionEmoji;
  prize.price = args.price;
  await prize.save();

  logEvent(
    args.client,
    args.message,
    `${EMOJI_PRIZE_EVENT} \`@${args.message.author.tag}\` edited prize! \`${prize.description}\``,
  );

  return `${EMOJI_JOB_WELL_DONE} Done!`;
};

export const command = 'edit <id> <description> <reactionEmoji> <price>';
export const describe = 'Edit a prize';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = editPrize(args);
};
