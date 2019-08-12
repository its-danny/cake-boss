import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Server from '../../../entity/server';
import { canManage } from '../../../utils/permissions';
import { logEvent } from '../../../utils/logger';

type Config =
  | 'command-prefix'
  | 'log-channel'
  | 'redeem-channel'
  | 'manager-roles'
  | 'blesser-roles'
  | 'dropper-roles'
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
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (args.config === 'command-prefix') {
    const prefix = args.value.trim();

    if (prefix === '') {
      return '😨 Invalid prefix, sorry!';
    }

    server.config.commandPrefix = prefix;
  }

  if (args.config === 'log-channel') {
    const channelId = args.value.replace(/^<#/, '').replace(/>$/, '');
    server.config.logChannelId = channelId;
  }

  if (args.config === 'redeem-channel') {
    const channelId = args.value.replace(/^<#/, '').replace(/>$/, '');
    server.config.redeemChannelId = channelId;
  }

  if (args.config === 'manager-roles') {
    server.config.managerRoles = args.value.split(',').filter(roleName => {
      return args.message.guild.roles.find(role => role.name === roleName.trim());
    });
  }

  if (args.config === 'blesser-roles') {
    server.config.blesserRoles = args.value.split(',').filter(roleName => {
      return args.message.guild.roles.find(role => role.name === roleName.trim());
    });
  }

  if (args.config === 'dropper-roles') {
    server.config.dropperRoles = args.value.split(',').filter(roleName => {
      return args.message.guild.roles.find(role => role.name === roleName.trim());
    });
  }

  if (args.config === 'cake-emoji') {
    server.config.cakeEmoji = args.value;
  }

  if (args.config === 'cake-name-singular') {
    server.config.cakeNameSingular = args.value;
  }

  if (args.config === 'cake-name-plural') {
    server.config.cakeNamePlural = args.value;
  }

  if (args.config === 'requirement-to-give') {
    const minimum = parseInt(args.value, 10);

    if (!Number.isInteger(minimum) || minimum < 0) {
      return '😨 Invalid requirement, sorry! Must be a positive number!';
    }

    server.config.requirementToGive = minimum;
  }

  if (args.config === 'give-limit') {
    const limit = parseInt(args.value, 10);

    if (!Number.isInteger(limit) || limit < 1) {
      return '😨 Invalid limit, sorry! Must be 1 or more.';
    }

    server.config.giveLimit = limit;
  }

  if (args.config === 'give-limit-hour-reset') {
    const reset = parseInt(args.value, 10);

    if (!Number.isInteger(reset) || reset < 1) {
      return '😨 Invalid hour, sorry! Must be 1 or more.';
    }

    server.config.giveLimitHourReset = reset;
  }

  await server.config.save();
  await logEvent(args.client, args.message, `⚙️ \`${args.config}\` set to \`${args.value}\`.`);

  return '😁 Done!';
};

export const command = 'set <config> <value>';
export const describe = 'Set a server config';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = setConfig(args);
};
