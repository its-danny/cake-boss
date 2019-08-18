import { Argv } from 'yargs';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Member from '../../../entity/member';
import ShamedMember from '../../../entity/shamed-member';
import {
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_RECORD_NOT_FOUND,
  EMOJI_JOB_WELL_DONE,
  EMOJI_SHAME,
} from '../../../utils/emoji';
import { logEvent } from '../../../utils/logger';
import { CommandArguments } from '../../../utils/command-arguments';

export interface Arguments extends CommandArguments {
  member: string;
}

export const unshameMember = async (args: Arguments): Promise<string | void> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['shamed', 'config'] });

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

  const shamedMember = await ShamedMember.findOne({
    where: { server, member },
    relations: ['server', 'member'],
  });

  if (shamedMember) {
    await shamedMember.remove();
  }

  logEvent(
    args.client,
    args.message,
    `${EMOJI_SHAME} \`${args.message.author.tag}\` removed \`${discordMember.user.tag}\` from the shame list.`,
  );

  if (server.config.quietMode) {
    args.message.react(EMOJI_JOB_WELL_DONE);

    return undefined;
  }
  return `${EMOJI_JOB_WELL_DONE} Done!`;
};

export const command = 'remove <member>';
export const describe = 'Reluctantly unshame someone';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = unshameMember(args);
};
