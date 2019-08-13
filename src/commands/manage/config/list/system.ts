import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Table from 'cli-table';
import { canManage } from '../../../../utils/permissions';
import Server from '../../../../entity/server';
import { EMOJI_INCORRECT_PERMISSIONS } from '../../../../utils/emoji';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string[] | string> | null;
}

export const getConfigList = async (args: Arguments): Promise<string[] | string> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const table = new Table({
    head: ['Name', 'Description', 'Value', 'Default'],
    style: { head: [], border: [] },
  });

  table.push(['command-prefix', `It's the command prefix!`, server.config.commandPrefix, '-']);

  const logChannel = server.config.logChannelId ? args.message.guild.channels.get(server.config.logChannelId) : null;

  table.push(['log-channel', 'Where to log events', logChannel ? `#${logChannel.name}` : '', '']);

  const redeemChannel = server.config.redeemChannelId
    ? args.message.guild.channels.get(server.config.redeemChannelId)
    : null;

  table.push([
    'redeem-channel',
    'Where to log prize redeem requests',
    redeemChannel ? `#${redeemChannel.name}` : '',
    '',
  ]);

  table.push([
    'manager-roles',
    'Roles allowed to manage Cake Boss (comma-separated)',

    server.config.managerRoleIds
      .map(roleId => {
        const role = args.message.guild.roles.get(roleId);

        if (role) {
          return role.name;
        }
      })
      .join(', '),

    '',
  ]);

  table.push([
    'blesser-roles',
    'Roles allowed to bless others with cake (comma-separated)',

    server.config.blesserRoleIds
      .map(roleId => {
        const role = args.message.guild.roles.get(roleId);

        if (role) {
          return role.name;
        }
      })
      .join(', '),

    '',
  ]);

  table.push([
    'dropper-roles',
    'Roles allowed to drop cakes in channels (comma-separated)',

    server.config.dropperRoleIds
      .map(roleId => {
        const role = args.message.guild.roles.get(roleId);

        if (role) {
          return role.name;
        }
      })
      .join(', '),

    '',
  ]);

  return `${server.config.cakeEmoji} **System Config**\n\n\`\`\`\n${table.toString()}\n\`\`\``;
};

export const command = 'system';
export const describe = 'View system config settings';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getConfigList(args);
};
