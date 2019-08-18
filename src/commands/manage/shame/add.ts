import { Argv } from 'yargs';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Member from '../../../entity/member';
import ShamedMember from '../../../entity/shamed-member';
import { CommandArguments } from '../../../utils/command-arguments';
import {
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_RECORD_NOT_FOUND,
  EMOJI_JOB_WELL_DONE,
  EMOJI_SHAME,
} from '../../../utils/emoji';
import { logEvent } from '../../../utils/logger';

export interface Arguments extends CommandArguments {
  member: string;
}

export const shameMember = async (args: Arguments): Promise<string | void> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const memberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');
  const discordMember = args.message.guild.members.get(memberId);

  if (!discordMember) {
    return `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`;
  }

  const member = await Member.findOne({ where: { discordId: discordMember.id } });

  if (!member) {
    throw new Error('Could not find member.');
  }

  const shamedMember = new ShamedMember();
  shamedMember.member = member;
  shamedMember.server = server;
  await shamedMember.save();

  logEvent(
    args.client,
    args.message,
    `${EMOJI_SHAME} \`${args.message.author.tag}\` added \`${discordMember.user.tag}\` to the shame list.`,
  );

  if (server.config.quietMode) {
    args.message.react(EMOJI_JOB_WELL_DONE);

    return undefined;
  }
  return `${EMOJI_JOB_WELL_DONE} Done!`;
};

export const command = 'add <member>';
export const describe = 'Shame someone';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = shameMember(args);
};
