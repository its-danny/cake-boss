import { Argv } from 'yargs';
import Server from '../../entity/server';
import Member from '../../entity/member';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';

export const getBalance = async (args: CommandArguments): Promise<CommandResponse> => {
  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, cache: true });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const member = await Member.findOne({ where: { server, discordId: args.message.member.id }, cache: true });

  if (!member) {
    throw new Error('Could not find member.');
  }

  return {
    content: `${server.config.cakeEmoji} Your current balance is ${member.balance} ${
      member.balance === 1 ? server.config.cakeNameSingular : server.config.cakeNamePlural
    }!`,
  };
};

export const command = 'balance';
export const describe = 'Check your cake balance';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getBalance(args);
};
