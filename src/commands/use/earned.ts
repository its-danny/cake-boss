import { Argv } from 'yargs';
import Server from '../../entity/server';
import Member from '../../entity/member';
import { CommandArguments } from '../../utils/command-arguments';

export const getEarned = async (args: CommandArguments): Promise<string> => {
  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

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

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getEarned(args);
};
