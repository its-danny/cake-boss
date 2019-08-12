import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const getEarned = async (args: Arguments): Promise<string> => {
  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const member = server.members.find(mem => mem.discordId === args.message.member.id);

  if (!member) {
    return `You ain't got any!`;
  }

  return `You've earned a total of ${member.earned} ${server.config.cakeEmoji}!`;
};

export const command = 'earned';
export const describe = `View how many cakes you've earned`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getEarned(args);
};
