import { Argv } from "yargs";

import { ConfigCommand } from "../../../entity/config";
import Server from "../../../entity/server";
import { CommandArguments, CommandResponse } from "../../../utils/command-interfaces";
import { EMOJI_CONFIG, EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS } from "../../../utils/emoji";
import { handleError } from "../../../utils/errors";
import { canManage } from "../../../utils/permissions";

interface Arguments extends CommandArguments {
  config: ConfigCommand;
}

export const getValue = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return {
        content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`,
      };
    }

    if (!args.message.guild) {
      throw new Error("Could not find Discord Guild.");
    }

    const server = await Server.findOne({
      where: { discordId: args.message.guild.id },
    });

    if (!server) {
      throw new Error("Could not find server.");
    }

    const value = server.config.getValue(args.config, args.message.guild);

    if (value) {
      return {
        content: `${EMOJI_CONFIG} \`${args.config}\` is currently set to \`${value.value}\`, the default is \`${value.default}\`.`,
      };
    }

    return { content: `${EMOJI_ERROR} Not a valid config!` };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = "value <config>";
export const describe = "Get the current value of a config option";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = getValue(args);
};
