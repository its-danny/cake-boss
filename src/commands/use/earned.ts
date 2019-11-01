import { Argv } from 'yargs';
import Server from '../../entity/server';
import Member from '../../entity/member';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';
import { handleError } from '../../utils/errors';

export interface Arguments extends CommandArguments {
  member?: string;
}

export const getEarned = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

    if (!server) {
      throw new Error('Could not find server.');
    }

    let usingMember = false;
    let member: Member | undefined;

    if (args.member) {
      const receivingMemberId = args.member.replace(/^<@!?/, '').replace(/>$/, '');

      usingMember = true;
      member = await Member.findOne({ where: { server, discordId: receivingMemberId } });
    } else {
      member = await Member.findOne({ where: { server, discordId: args.message.member.id } });
    }

    if (!member) {
      throw new Error('Could not find member.');
    }

    return {
      content: `${server.config.cakeEmoji} ${usingMember ? 'They' : 'You'} have earned a total of ${member.earned} ${
        member.earned === 1 ? server.config.cakeNameSingular : server.config.cakeNamePlural
      }!`,
    };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = 'earned [member]';
export const describe = `Check how many cakes you or another member has earned over time`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getEarned(args);
};
