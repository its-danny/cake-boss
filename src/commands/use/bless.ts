import { Argv } from 'yargs';
import Server from '../../entity/server';
import { canBless, isShamed } from '../../utils/permissions';
import Member from '../../entity/member';
import { logEvent } from '../../utils/logger';
import { EMOJI_DONT_DO_THAT, EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';

export interface Arguments extends CommandArguments {
  member: string;
  amount?: number;
}

export const blessMember = async (args: Arguments): Promise<string | void> => {
  if (!(await canBless(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const blessedMemberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');
  const blessedDiscordMember = args.message.guild.members.get(blessedMemberId);

  if (!blessedDiscordMember) {
    return `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`;
  }

  if (await isShamed(server.discordId, blessedDiscordMember.id)) {
    return `${EMOJI_DONT_DO_THAT} They have been **shamed** and can not get ${server.config.cakeNamePlural}!`;
  }

  const blessedMember = await Member.findOne({ where: { discordId: blessedDiscordMember.id } });

  if (!blessedMember) {
    throw new Error('Could not find member.');
  }

  const amount = args.amount ? args.amount : 1;

  blessedMember.earned += amount;
  blessedMember.balance += amount;

  await blessedMember.save();

  logEvent(
    args.client,
    args.message,
    `${server.config.cakeEmoji} \`${args.message.author.tag}\` blessed \`${
      blessedDiscordMember.user.tag
    }\` with ${amount} ${amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular}!`,
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

export const command = 'bless <member> [amount]';
export const describe = 'Bless them with cakes';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = blessMember(args);
};
