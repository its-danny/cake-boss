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

export const getBalance = async (args: Arguments): Promise<string> => {
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

  return `${server.config.cakeEmoji} Your current balance is ${member.balance} ${
    member.balance === 1 ? server.config.cakeNameSingular : server.config.cakeNamePlural
  }!`;
};

export const command = 'balance';
export const describe = 'Check your cake balance';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getBalance(args);
};
