import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../entity/server';
import Member from '../../entity/member';

export interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const getEarned = async (args: Arguments): Promise<string> => {
  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const member = await Member.findOne({ where: { server, discordId: args.message.member.id } });

  if (!member) {
    throw new Error('Could not find member.');
  }

  return `${server.config.cakeEmoji} You've earned a total of ${member.earned} ${
    member.earned === 1 ? server.config.cakeNameSingular : server.config.cakeNamePlural
  }!`;
};

export const command = 'earned';
export const describe = `Check how many cakes you've earned over time`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getEarned(args);
};
