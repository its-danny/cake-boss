import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Prize from '../../../entity/prize';
import { logEvent } from '../../../utils/logger';
import {
  EMOJI_VALIDATION_ERROR,
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_PRIZE_EVENT,
  EMOJI_JOB_WELL_DONE,
} from '../../../utils/emoji';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  description: string;
  reactionEmoji: string;
  price: number;
  role?: string;
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const addPrize = async (args: Arguments): Promise<string> => {
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

  if (args.description === '') {
    return `${EMOJI_VALIDATION_ERROR} Description required!`;
  }

  if (args.reactionEmoji === '') {
    return `${EMOJI_VALIDATION_ERROR} Reaction emoji required!`;
  }

  if (args.price <= 0) {
    return `${EMOJI_VALIDATION_ERROR} Price must be 1 or more!`;
  }

  let roleId;

  if (args.role) {
    const roleFound = args.message.guild.roles.find(role => role.name === args.role);

    if (roleFound) {
      roleId = roleFound.id;
    } else {
      return `${EMOJI_VALIDATION_ERROR} Role must be valid!`;
    }
  }

  const prize = new Prize();
  prize.server = server;
  prize.description = args.description;
  prize.reactionEmoji = args.reactionEmoji;
  prize.price = args.price;

  if (roleId) {
    prize.roleId = roleId;
  }

  await prize.save();

  logEvent(
    args.client,
    args.message,
    `${EMOJI_PRIZE_EVENT} \`@${args.message.author.tag}\` added a new prize! \`${prize.description}\``,
  );

  return `${EMOJI_JOB_WELL_DONE} Done!`;
};

export const command = 'add <description> <reactionEmoji> <price> [role]';
export const describe = 'Add a prize';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = addPrize(args);
};
