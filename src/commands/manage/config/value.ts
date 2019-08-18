import { Argv } from 'yargs';
import { CommandArguments } from '../../../utils/command-arguments';
import { canManage } from '../../../utils/permissions';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_ERROR, EMOJI_CONFIG } from '../../../utils/emoji';
import Server from '../../../entity/server';
import { ConfigCommand } from '../../../entity/config';

interface Arguments extends CommandArguments {
  config: ConfigCommand;
}

export const getValue = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const value = server.config.getValue(args.config, args.message.guild);

  if (value) {
    return `${EMOJI_CONFIG} \`${args.config}\` is currently set to \`${value.value}\`, the default is \`${value.default}\`.`;
  }

  return `${EMOJI_ERROR} Not a valid config!`;
};

export const command = 'value <config>';
export const describe = 'Get the current value of a config option';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = getValue(args);
};
