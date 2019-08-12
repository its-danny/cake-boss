import { Argv } from 'yargs';
import { Client, Message, TextChannel } from 'discord.js';
import Server from '../../entity/server';
import Drop from '../../entity/drop';
import { logEvent } from '../../utils/logger';
import Member from '../../entity/member';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const takeCake = async (args: Arguments): Promise<string> => {
  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const drop = await Drop.findOne({ where: { server, channelDiscordId: args.message.channel.id } });

  if (!drop) {
    return `😢 There are no drops here!`;
  }

  drop.amount -= 1;

  if (drop.amount <= 0) {
    await drop.remove();
  } else {
    await drop.save();
  }

  await args.message.guild.fetchMembers();
  const member = await Member.findOrCreate(args.message.guild.id, args.message.author.id, args.message.member.id);

  member.earned += 1;
  member.balance += 1;

  await member.save();

  const discordChannel = args.message.guild.channels.get(args.message.channel.id) as TextChannel;

  logEvent(
    args.client,
    args.message,
    `${server.config.cakeEmoji} \`@${args.message.author.tag}\` took a ${server.config.cakeNameSingular} from \`#${discordChannel.name}\`!`,
  );

  return `😁 You got it, <@${args.message.member.id}>!`;
};

export const command = 'take';
export const describe = 'Take a dropped cake';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = takeCake(args);
};
