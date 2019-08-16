import { Argv } from 'yargs';
import Server from '../../entity/server';
import { canGive, isShamed } from '../../utils/permissions';
import Member from '../../entity/member';
import { logEvent } from '../../utils/logger';
import { EMOJI_DONT_DO_THAT, EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND, EMOJI_WORKING_HARD } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';

export interface Arguments extends CommandArguments {
  member: string;
  amount?: number;
}

export const giveCakeToMember = async (args: Arguments): Promise<string | void> => {
  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (server.config.noGiving) {
    return `${EMOJI_WORKING_HARD} You can't give ${server.config.cakeNamePlural}!`;
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

  if (server.config.quietMode) {
    let react;

    if (/\b:\d{18}/.test(server.config.cakeEmoji)) {
      react = server.config.cakeEmoji.match(/\d{18}/)![0];
    } else {
      react = server.config.cakeEmoji;
    }

    args.message.react(react);
  } else {
    return `${server.config.cakeEmoji} They just got ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    }, <@${args.message.member.id}>!`;
  }
};

export const command = 'give <member> [amount]';
export const describe = 'Give someone cake!';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = giveCakeToMember(args);
};
