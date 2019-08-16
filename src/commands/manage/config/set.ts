import { Argv } from 'yargs';
import Server from '../../../entity/server';
import { canManage } from '../../../utils/permissions';
import { logEvent } from '../../../utils/logger';
import {
  EMOJI_ERROR,
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_CONFIG_EVENT,
  EMOJI_JOB_WELL_DONE,
} from '../../../utils/emoji';
import { CommandArguments } from '../../../utils/command-arguments';

type Config =
  | 'command-prefix'
  | 'quiet-mode'
  | 'log-channel'
  | 'log-with-link'
  | 'redeem-channel'
  | 'manager-roles'
  | 'blesser-roles'
  | 'dropper-roles'
  | 'nickname'
  | 'cake-emoji'
  | 'cake-name-singular'
  | 'cake-name-plural'
  | 'no-giving'
  | 'requirement-to-give'
  | 'give-limit'
  | 'give-limit-hour-reset';

interface Arguments extends CommandArguments {
  config: Config;
  value: string;
}

export const setConfig = async (args: Arguments): Promise<string | void> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  let configSet = false;

  if (args.config === 'command-prefix') {
    const prefix = args.value.trim();

    if (prefix === '') {
      return `${EMOJI_ERROR} Invalid prefix, sorry!`;
    }

    server.config.commandPrefix = prefix;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'quiet-mode') {
    const toggle = args.value.trim();

    if (toggle !== 'true' && toggle !== 'false') {
      return `${EMOJI_ERROR} It's a true or false question!`;
    }

    server.config.quietMode = toggle === 'true';

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'log-channel') {
    const channelId = args.value.replace(/^<#/, '').replace(/>$/, '');
    const channel = args.message.guild.channels.get(channelId);

    if (!channel) {
      return `${EMOJI_ERROR} Not a valid channel!`;
    }

    server.config.logChannelId = channelId;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`#${channel.name}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'log-with-link') {
    const toggle = args.value.trim();

    if (toggle !== 'true' && toggle !== 'false') {
      return `${EMOJI_ERROR} It's a true or false question!`;
    }

    server.config.logWithLink = toggle === 'true';

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'redeem-channel') {
    const channelId = args.value.replace(/^<#/, '').replace(/>$/, '');
    const channel = args.message.guild.channels.get(channelId);

    if (!channel) {
      return `${EMOJI_ERROR} Not a valid channel!`;
    }

    server.config.redeemChannelId = channelId;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`#${channel.name}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'manager-roles') {
    const foundRolesIds = args.value
      .split(',')
      .filter(roleName => {
        return args.message.guild.roles.find(role => role.name === roleName.trim());
      })
      .map(roleName => args.message.guild.roles.find(role => role.name === roleName.trim()).id);

    const foundRolesNames = args.value.split(',').filter(roleName => {
      return args.message.guild.roles.find(role => role.name === roleName.trim());
    });

    const notFoundRoles = args.value.split(',').filter(roleName => {
      return !args.message.guild.roles.find(role => role.name === roleName.trim());
    });

    server.config.managerRoleIds = foundRolesIds;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${foundRolesNames.join(
        ', ',
      )}\`.`,
    );

    if (notFoundRoles.length > 0) {
      return `${EMOJI_JOB_WELL_DONE} Done! The following roles were skipped for not existing: ${notFoundRoles.join(
        ', ',
      )}`;
    }

    configSet = true;
  }

  if (args.config === 'blesser-roles') {
    const foundRolesIds = args.value
      .split(',')
      .filter(roleName => {
        return args.message.guild.roles.find(role => role.name === roleName.trim());
      })
      .map(roleName => args.message.guild.roles.find(role => role.name === roleName.trim()).id);

    const foundRolesNames = args.value.split(',').filter(roleName => {
      return args.message.guild.roles.find(role => role.name === roleName.trim());
    });

    const notFoundRoles = args.value.split(',').filter(roleName => {
      return !args.message.guild.roles.find(role => role.name === roleName.trim());
    });

    server.config.blesserRoleIds = foundRolesIds;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${foundRolesNames.join(
        ', ',
      )}\`.`,
    );

    if (notFoundRoles.length > 0) {
      return `${EMOJI_JOB_WELL_DONE} Done! The following roles were skipped for not existing: ${notFoundRoles.join(
        ', ',
      )}`;
    }

    configSet = true;
  }

  if (args.config === 'dropper-roles') {
    const foundRolesIds = args.value
      .split(',')
      .filter(roleName => {
        return args.message.guild.roles.find(role => role.name === roleName.trim());
      })
      .map(roleName => args.message.guild.roles.find(role => role.name === roleName.trim()).id);

    const foundRolesNames = args.value.split(',').filter(roleName => {
      return args.message.guild.roles.find(role => role.name === roleName.trim());
    });

    const notFoundRoles = args.value.split(',').filter(roleName => {
      return !args.message.guild.roles.find(role => role.name === roleName.trim());
    });

    server.config.dropperRoleIds = foundRolesIds;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${foundRolesNames.join(
        ', ',
      )}\`.`,
    );

    if (notFoundRoles.length > 0) {
      return `${EMOJI_JOB_WELL_DONE} Done! The following roles were skipped for not existing: ${notFoundRoles.join(
        ', ',
      )}`;
    }

    configSet = true;
  }

  if (args.config === 'nickname') {
    if (args.value.trim() === '') {
      return `${EMOJI_ERROR} That's not a nickname!`;
    }

    server.config.nickname = args.value;
    await server.config.save();

    const member = args.message.guild.members.get(args.client.user.id);

    if (server && member) {
      member.setNickname(server.config.nickname);
    }

    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'cake-emoji') {
    server.config.cakeEmoji = args.value;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'cake-name-singular') {
    server.config.cakeNameSingular = args.value;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'cake-name-plural') {
    server.config.cakeNamePlural = args.value;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'no-giving') {
    const toggle = args.value.trim();

    if (toggle !== 'true' && toggle !== 'false') {
      return `${EMOJI_ERROR} It's a true or false question!`;
    }

    server.config.noGiving = toggle === 'true';

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'requirement-to-give') {
    const minimum = parseInt(args.value, 10);

    if (!Number.isInteger(minimum) || minimum < 0) {
      return `${EMOJI_ERROR} Invalid requirement, sorry! Must be a positive number!`;
    }

    server.config.requirementToGive = minimum;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'give-limit') {
    const limit = parseInt(args.value, 10);

    if (!Number.isInteger(limit) || limit < 1) {
      return `${EMOJI_ERROR} Invalid limit, sorry! Must be 1 or more.`;
    }

    server.config.giveLimit = limit;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (args.config === 'give-limit-hour-reset') {
    const reset = parseInt(args.value, 10);

    if (!Number.isInteger(reset) || reset < 1) {
      return `${EMOJI_ERROR} Invalid hour, sorry! Must be 1 or more.`;
    }

    server.config.giveLimitHourReset = reset;

    await server.config.save();
    await logEvent(
      args.client,
      args.message,
      `${EMOJI_CONFIG_EVENT} \`${args.message.author.tag}\` set \`${args.config}\` to \`${args.value}\`.`,
    );

    configSet = true;
  }

  if (configSet) {
    if (server.config.quietMode) {
      args.message.react(EMOJI_JOB_WELL_DONE);

      return undefined;
    }
    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }
  return `${EMOJI_ERROR} Not a valid config!`;
};

export const command = 'set <config> <value>';
export const describe = 'Set a config';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = setConfig(args);
};
