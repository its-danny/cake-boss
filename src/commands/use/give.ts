import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';
import { canGive } from '../../utils/permissions';
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

export const giveCakeToMember = async (args: Arguments): Promise<string> => {
  if (!(await canGive(args.message))) {
    return `😝 You can't do that yet!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (server) {
    await args.message.guild.fetchMembers();

    const memberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');
    const discordMember = args.message.guild.members.get(memberId);

    if (!discordMember) {
      return `😢 Uh oh, I couldn't find them.`;
    }

    let receivingMember = await Member.findOne({ where: { discordId: discordMember.id } });

    if (!receivingMember) {
      const user = new User();
      user.discordId = discordMember.user.id;

      await user.save();

      receivingMember = new Member();
      receivingMember.discordId = discordMember.id;
      receivingMember.server = server;
      receivingMember.user = user;

      await receivingMember.save();
    }

    const givingMember = await Member.findOne({ where: { discordId: args.message.member.id } });

    if (!givingMember) {
      return `😢 Uh oh, I couldn't find you.`;
    }

    let amount = args.amount ? args.amount : 1;

    if (amount > server.config.giveLimit) {
      amount = server.config.giveLimit;
    }

    if (amount > server.config.giveLimit - givingMember.givenSinceReset) {
      amount -= server.config.giveLimit - givingMember.givenSinceReset;
    }

    receivingMember.earned += amount;
    receivingMember.balance += amount;

    await receivingMember.save();

    givingMember.given += amount;
    givingMember.givenSinceReset += amount;

    await givingMember.save();

    logEvent(
      args.client,
      args.message,
      `${server.config.cakeEmoji}  \`${args.message.author.tag}\` gave \`${discordMember.user.tag}\` ${amount} ${
        amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
      }!`,
    );

    return `<@${args.message.member.id}> gave <@${receivingMember.discordId}> ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    }! ${server.config.cakeEmoji}`;
  }

  throw new Error('Could not find server.');
};

export const command = 'give <member> [amount]';
export const describe = 'Give someone cakes';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = giveCakeToMember(args);
};
