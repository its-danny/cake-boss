import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Member from '../../../entity/member';
import ShamedMember from '../../../entity/shamed-member';

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
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['shamed'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  await args.message.guild.fetchMembers();

  const memberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');
  const discordMember = args.message.guild.members.get(memberId);

  if (!discordMember) {
    return `😢 Uh oh, I couldn't find them.`;
  }

  const member = await Member.findOrCreate(args.message.guild.id, discordMember.user.id, discordMember.id);

  const shamedMember = new ShamedMember();
  shamedMember.member = member;
  shamedMember.server = server;
  await shamedMember.save();

  return '😁 Done!';
};

export const command = 'add <member>';
export const describe = 'Shame someone';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = shameMember(args);
};
