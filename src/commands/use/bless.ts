import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';
import { canBless } from '../../utils/permissions';
import Member from '../../entity/member';
import User from '../../entity/user';
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

export const blessMember = async (args: Arguments): Promise<string> => {
  if (!(await canBless(args.message))) {
    return `You ain't got permission to do that! 😝`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (server) {
    await args.message.guild.fetchMembers();

    const memberId = args.member.replace('<@', '').replace('>', '');
    const discordMember = args.message.guild.members.get(memberId);

    if (!discordMember) {
      return `😢 Uh oh, I couldn't find that member.`;
    }

    let member: Member | undefined = await Member.findOne({ where: { discordId: discordMember.id } });

    if (!member) {
      const user = new User();
      user.discordId = discordMember.user.id;

      await user.save();

      member = new Member();
      member.discordId = discordMember.id;
      member.server = server;
      member.user = user;

      await member.save();
    }

    const amount = args.amount ? args.amount : 1;

    member.earned += amount;
    member.balance += amount;

    await member.save();

    logEvent(
      args.client,
      args.message,
      `${server.config.cakeEmoji} <@${args.message.member.id}> blessed <@${member.discordId}> with ${amount} ${
        amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
      }!`,
    );

    return `<@${args.message.member.id}> blessed <@${member.discordId}> with ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    }!`;
  }

  throw new Error('Could not find server.');
};

export const command = 'bless <member> [amount]';
export const describe = 'Bless someone';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = blessMember(args);
};
