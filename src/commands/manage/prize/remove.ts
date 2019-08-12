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
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const removePrize = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (server.config.redeemChannelId === '') {
    return `${EMOJI_VALIDATION_ERROR} You need to set the \`redeem-channel\` config before using prizes.`;
  }

  const prize = await Prize.findOne({ server, id: args.id });

  if (!prize) {
    return `${EMOJI_VALIDATION_ERROR} Couldn't find that prize, are you sure \`${args.id}\` is the right ID?`;
  }

  await prize.remove();

  logEvent(
    args.client,
    args.message,
    `${EMOJI_PRIZE_EVENT} \`@${args.message.author.tag}\` removed a prize! \`${prize.description}\``,
  );

  return `${EMOJI_JOB_WELL_DONE} Done!`;
};

export const command = 'remove <id>';
export const describe = 'Remove a prize';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = removePrize(args);
};
