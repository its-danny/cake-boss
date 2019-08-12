import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';
import { canManage } from '../../utils/permissions';
import Member from '../../entity/member';
import { logEvent } from '../../utils/logger';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  member: string;
  amount?: number;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const removeCakes = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  await args.message.guild.fetchMembers();

  const memberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');
  const discordMember = args.message.guild.members.get(memberId);

  if (!discordMember) {
    return `😢 Uh oh, I couldn't find them.`;
  }

  const member = await Member.findOne({ where: { discordId: discordMember.id } });

  if (!member) {
    return `😢 Uh oh, I couldn't find them.`;
  }

  const amount = args.amount ? args.amount : 1;

  if (!Number.isInteger(amount) && amount <= 0) {
    return '😨 Invalid amount, sorry!';
  }

  if (member.balance > 0) {
    member.balance -= 1;
  }

  await member.save();

  logEvent(
    args.client,
    args.message,
    `${server.config.cakeEmoji} \`${args.message.author.tag}\` removed ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    } from \`${discordMember.user.tag}\`.`,
  );

  return '😁 Done!';
};

export const command = 'remove <member> [amount]';
export const describe = `Remove cakes from somone's balance (when redeeming for prizes)`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = removeCakes(args);
};
