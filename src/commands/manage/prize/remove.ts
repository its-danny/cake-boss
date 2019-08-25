import { Argv } from 'yargs';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Prize from '../../../entity/prize';
import { logEvent } from '../../../utils/logger';
import { CommandArguments, CommandResponse } from '../../../utils/command-interfaces';
import { EMOJI_ERROR, EMOJI_JOB_WELL_DONE, EMOJI_INCORRECT_PERMISSIONS, EMOJI_CONFIG } from '../../../utils/emoji';

export interface Arguments extends CommandArguments {
  id: number;
}

export const removePrize = async (args: Arguments): Promise<CommandResponse | void> => {
  if (!(await canManage(args.message))) {
    return { content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!` };
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (!server.config.redeemChannelId || server.config.redeemChannelId === '') {
    return { content: `${EMOJI_ERROR} You need to set the \`redeem-channel\` config before using prizes.` };
  }

  const prize = await Prize.findOne({ server, id: args.id });

  if (!prize) {
    return { content: `${EMOJI_ERROR} Couldn't find that prize, are you sure \`${args.id}\` is the right ID?` };
  }

  await prize.remove();

  logEvent(
    args.client,
    args.message,
    `${EMOJI_CONFIG} \`${args.message.author.tag}\` removed a prize: \`${prize.description}\``,
  );

  if (server.config.quietMode) {
    args.message.react(EMOJI_JOB_WELL_DONE);

    return undefined;
  }

  return { content: `${EMOJI_JOB_WELL_DONE} Done!` };
};

export const command = 'remove <id>';
export const describe = 'Remove a prize';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = removePrize(args);
};
