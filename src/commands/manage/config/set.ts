import { Argv } from 'yargs';
import Server from '../../../entity/server';
import { canManage } from '../../../utils/permissions';
import { logEvent } from '../../../utils/logger';
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_CONFIG, EMOJI_JOB_WELL_DONE } from '../../../utils/emoji';
import { CommandArguments, CommandResponse } from '../../../utils/command-interfaces';
import { ConfigCommand } from '../../../entity/config';
import { handleError } from '../../../utils/errors';

interface Arguments extends CommandArguments {
  config: ConfigCommand;
  value: string;
}

export const ERROR_MESSAGE = `Incorrect arguments, sorry! Maybe you need the docs? <https://dannytatom.github.io/cake-boss/>`;

export const setConfig = async (args: Arguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return { content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!` };
    }

    const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

    if (!server) {
      throw new Error('Could not find server.');
    }

    let configSet = false;

    if (args.config === 'command-prefix') {
      if (server.config.setCommandPrefix(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'quiet-mode') {
      if (args.value === 'true' && !args.message.guild.me.hasPermission('ADD_REACTIONS')) {
        return { content: `${EMOJI_ERROR} I need permission to \`add reactions\`!` };
      }

      if (server.config.setQuietMode(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        return { content: `${EMOJI_JOB_WELL_DONE} Done!` };
      }

      return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
    }

    if (args.config === 'log-channel') {
      if (server.config.setLogChannel(args.value, args.message.guild)) {
        await server.config.save();

        const channel = args.message.guild.channels.get(args.value.replace(/^<#/, '').replace(/>$/, ''));

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${
            channel ? `#${channel.name}` : 'none'
          }\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'log-with-link') {
      if (server.config.setLogWithLink(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'redeem-channel') {
      if (server.config.setRedeemChannel(args.value, args.message.guild)) {
        await server.config.save();

        const channel = args.message.guild.channels.get(args.value.replace(/^<#/, '').replace(/>$/, ''));

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${
            channel ? `#${channel.name}` : 'none'
          }\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'redeem-timer') {
      if (server.config.setRedeemTimer(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'manager-roles') {
      if (server.config.setRoles(args.value, args.config, args.message.guild)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` updated \`${args.config}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'blesser-roles') {
      if (server.config.setRoles(args.value, args.config, args.message.guild)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` updated \`${args.config}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'dropper-roles') {
      if (server.config.setRoles(args.value, args.config, args.message.guild)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` updated \`${args.config}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'redeem-ping-roles') {
      if (server.config.setRoles(args.value, args.config, args.message.guild)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` updated \`${args.config}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'nickname') {
      if (!args.message.guild.me.hasPermission('CHANGE_NICKNAME')) {
        return { content: `${EMOJI_ERROR} I need permission to \`change nickname\`!` };
      }

      if (server.config.setNickname(args.value)) {
        await server.config.save();

        const member = args.message.guild.members.get(args.client.user.id);

        if (server && member) {
          member.setNickname(server.config.nickname);
        }

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'cake-emoji') {
      if (server.config.setCakeEmoji(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'cake-name-singular') {
      if (server.config.setCakeName(args.value, 'singular')) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'cake-name-plural') {
      if (server.config.setCakeName(args.value, 'plural')) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'drop-gifs') {
      if (server.config.setDropGifs(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value
            .split(',')
            .join(', ')}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'no-drop-gifs') {
      if (server.config.setNoDropGifs(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value
            .split(',')
            .join(', ')}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'no-giving') {
      if (server.config.setNoGiving(args.value)) {
        await server.config.save();
        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'requirement-to-give') {
      if (server.config.setRequirementToGive(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'give-limit') {
      if (server.config.setGiveLimit(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (args.config === 'give-limit-hour-reset') {
      if (server.config.setGiveLimitHourReset(args.value)) {
        await server.config.save();

        await logEvent(
          args.client,
          args.message,
          `${EMOJI_CONFIG} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
        );

        configSet = true;
      } else {
        return { content: `${EMOJI_ERROR} ${ERROR_MESSAGE}` };
      }
    }

    if (configSet) {
      if (server.config.quietMode) {
        args.message.react(EMOJI_JOB_WELL_DONE);

        return undefined;
      }

      return { content: `${EMOJI_JOB_WELL_DONE} Done!` };
    }

    return { content: `${EMOJI_ERROR} Not a valid config!` };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = 'set <config> <value>';
export const describe = 'Set a config option';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = setConfig(args);
};
