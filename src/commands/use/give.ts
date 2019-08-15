import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';
import { canGive, isShamed } from '../../utils/permissions';
import Member from '../../entity/member';
import { logEvent } from '../../utils/logger';
import { EMOJI_DONT_DO_THAT, EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND } from '../../utils/emoji';

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
  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (await isShamed(args.message.guild.id, args.message.member.id)) {
    return `${EMOJI_DONT_DO_THAT} You have been **shamed** and can not give ${server.config.cakeNamePlural}!`;
  }

  const receivingMemberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');
  const receivingDiscordMember = args.message.guild.members.get(receivingMemberId);

  if (!receivingDiscordMember) {
    return `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`;
  }

  if (receivingDiscordMember.id === args.message.member.id) {
    return `${EMOJI_DONT_DO_THAT} Don't be greedy!`;
  }

  if (await isShamed(server.discordId, receivingDiscordMember.id)) {
    return `${EMOJI_DONT_DO_THAT} They have been **shamed** and can not get ${server.config.cakeNamePlural}!`;
  }

  const receivingMember = await Member.findOne({ where: { discordId: receivingDiscordMember.id } });

  if (!receivingMember) {
    throw new Error('Could not find member.');
  }

  const givingMember = await Member.findOne({ where: { discordId: args.message.member.id } });

  if (!givingMember) {
    throw new Error('Could not find member.');
  }

  if (!(await canGive(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You can't do that yet!`;
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
    `${server.config.cakeEmoji}  \`${args.message.author.tag}\` gave \`${receivingDiscordMember.user.tag}\` ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    }!`,
  );

  return `${server.config.cakeEmoji} <@${args.message.member.id}> gave <@${receivingMember.discordId}> ${amount} ${
    amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
  }!`;
};

export const command = 'give <member> [amount]';
export const describe = 'Give someone cake!';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = giveCakeToMember(args);
};
