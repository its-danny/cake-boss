import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../../entity/server';
import { canManage } from '../../../utils/permissions';
import { logEvent } from '../../../utils/logger';
import {
  EMOJI_ERROR,
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_CONFIG_EVENT,
  EMOJI_JOB_WELL_DONE,
} from '../../../utils/emoji';

type Config =
  | 'command-prefix'
  | 'quiet-mode'
  | 'log-channel'
  | 'redeem-channel'
  | 'manager-roles'
  | 'blesser-roles'
  | 'dropper-roles'
  | 'nickname'
  | 'cake-emoji'
  | 'cake-name-singular'
  | 'cake-name-plural'
  | 'requirement-to-give'
  | 'give-limit'
  | 'give-limit-hour-reset';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  config: Config;
  value: string;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const setConfig = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (args.config === 'command-prefix') {
    const prefix = args.value.trim();

    if (prefix === '') {
      return `${EMOJI_ERROR} Invalid prefix, sorry!`;
    }

    server.config.commandPrefix = prefix;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'quiet-mode') {
    const toggle = args.value.trim();

    if (toggle !== 'true' && toggle !== 'false') {
      return `${EMOJI_ERROR} It's a true or false question!`;
    }

    server.config.quietMode = toggle === 'true';

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

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
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`#${channel.name}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'redeem-channel') {
    const channelId = args.value.replace(/^<#/, '').replace(/>$/, '');
    const channel = args.message.guild.channels.get(channelId);

    if (!channel) {
      return `${EMOJI_ERROR} Not a valid channel!`;
    }

    server.config.redeemChannelId = channelId;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`#${channel.name}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
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
      `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${foundRolesNames.join(', ')}\`.`,
    );

    if (notFoundRoles.length > 0) {
      return `${EMOJI_JOB_WELL_DONE} Done! The following roles were skipped for not existing: ${notFoundRoles.join(
        ', ',
      )}`;
    }

    return `${EMOJI_JOB_WELL_DONE} Done!`;
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
      `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${foundRolesNames.join(', ')}\`.`,
    );

    if (notFoundRoles.length > 0) {
      return `${EMOJI_JOB_WELL_DONE} Done! The following roles were skipped for not existing: ${notFoundRoles.join(
        ', ',
      )}`;
    }

    return `${EMOJI_JOB_WELL_DONE} Done!`;
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
      `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${foundRolesNames.join(', ')}\`.`,
    );

    if (notFoundRoles.length > 0) {
      return `${EMOJI_JOB_WELL_DONE} Done! The following roles were skipped for not existing: ${notFoundRoles.join(
        ', ',
      )}`;
    }

    return `${EMOJI_JOB_WELL_DONE} Done!`;
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

    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'cake-emoji') {
    server.config.cakeEmoji = args.value;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'cake-name-singular') {
    server.config.cakeNameSingular = args.value;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'cake-name-plural') {
    server.config.cakeNamePlural = args.value;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'requirement-to-give') {
    const minimum = parseInt(args.value, 10);

    if (!Number.isInteger(minimum) || minimum < 0) {
      return `${EMOJI_ERROR} Invalid requirement, sorry! Must be a positive number!`;
    }

    server.config.requirementToGive = minimum;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'give-limit') {
    const limit = parseInt(args.value, 10);

    if (!Number.isInteger(limit) || limit < 1) {
      return `${EMOJI_ERROR} Invalid limit, sorry! Must be 1 or more.`;
    }

    server.config.giveLimit = limit;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  if (args.config === 'give-limit-hour-reset') {
    const reset = parseInt(args.value, 10);

    if (!Number.isInteger(reset) || reset < 1) {
      return `${EMOJI_ERROR} Invalid hour, sorry! Must be 1 or more.`;
    }

    server.config.giveLimitHourReset = reset;

    await server.config.save();
    await logEvent(args.client, args.message, `${EMOJI_CONFIG_EVENT} \`${args.config}\` set to \`${args.value}\`.`);

    return `${EMOJI_JOB_WELL_DONE} Done!`;
  }

  return `${EMOJI_ERROR} Not a valid config!`;
};

export const command = 'set <config> <value>';
export const describe = 'Set a config';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = setConfig(args);
};
