import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
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

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  member: string;
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const shameMember = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['shamed'] });

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
    shamedMember.remove();
  }

  logEvent(
    args.client,
    args.message,
    `${EMOJI_SHAME} \`@${args.message.author.tag}\` removed \`@${discordMember.user.tag}\` from the shame list.`,
  );

  return `${EMOJI_JOB_WELL_DONE} Done!`;
};

export const command = 'remove <member>';
export const describe = 'Reluctantly unshame someone';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = shameMember(args);
};
