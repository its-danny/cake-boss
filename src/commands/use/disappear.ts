import { Argv } from 'yargs';
import Server from '../../entity/server';
import { canManage } from '../../utils/permissions';
import Member from '../../entity/member';
import { logEvent } from '../../utils/logger';
import {
  EMOJI_ERROR,
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_RECORD_NOT_FOUND,
  EMOJI_JOB_WELL_DONE,
} from '../../utils/emoji';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';
import { handleError } from '../../utils/errors';

export interface Arguments extends CommandArguments {
  member: string;
  amount?: number;
}

export const disappearCakes = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return { content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!` };
    }

    const server = await Server.findOne({ where: { discordId: args.message.guild.id }, cache: true });

    if (!server) {
      throw new Error('Could not find server.');
    }

    const targetMemberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');
    const targetDiscordMember = args.message.guild.members.get(targetMemberId);

    if (!targetDiscordMember) {
      return { content: `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.` };
    }

    const targetMember = await Member.findOne({ where: { discordId: targetDiscordMember.id }, cache: true });

    if (!targetMember) {
      throw new Error('Could not find member.');
    }

    const amount = args.amount ? args.amount : 1;

    if (!Number.isInteger(amount) && amount <= 0) {
      return { content: `${EMOJI_ERROR} Invalid amount, sorry!` };
    }

    if (targetMember.balance < amount) {
      targetMember.balance = 0;
    } else {
      targetMember.balance -= amount;
    }

    if (targetMember.earned < amount) {
      targetMember.earned = 0;
    } else {
      targetMember.earned -= amount;
    }

    await targetMember.save();

    logEvent(
      args.client,
      args.message,
      `${server.config.cakeEmoji} \`${args.message.author.tag}\` disappeared ${amount} ${
        amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
      } from \`${targetDiscordMember.user.tag}\`.`,
    );

    if (server.config.quietMode) {
      args.message.react(EMOJI_JOB_WELL_DONE);

      return undefined;
    }

    return { content: `${EMOJI_JOB_WELL_DONE} Done!` };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = 'disappear <member> [amount]';
export const describe = `Erase some cakes from history`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = disappearCakes(args);
};
