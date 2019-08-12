import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import Table from 'cli-table';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const getConfigList = async (args: Arguments): Promise<string> => {
  if (!(await canManage(args.message))) {
    return `You ain't got permission to do that! 😝`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (server) {
    const table = new Table({
      head: ['Name', 'Description', 'Value', 'Default'],
      style: { head: [], border: [] },
    });

    table.push(['log-channel', 'Where to log events', server.config.logChannelId, '']);

    table.push([
      'manager-roles',
      'Roles allowed to manage Cake Boss (comma-separated)',
      server.config.managerRoles.join(', '),
      '',
    ]);
    table.push([
      'blesser-roles',
      'Roles allowed to bless others with cake (comma-separated)',
      server.config.blesserRoles.join(', '),
      '',
    ]);

    table.push(['cake-emoji', 'Emoji to use for cakes', server.config.cakeEmoji, '🍰']);
    table.push(['cake-name-singular', 'Name to use for cake (singular)', server.config.cakeNameSingular, 'cake']);
    table.push(['cake-name-plural', 'Name to use for cake (plural)', server.config.cakeNamePlural, 'cakes']);

    const response = [
      '**Config**\n',
      'Use `-config set <config> <value>` to change config options.',
      `\n\`\`\`\n\n${table.toString()}\n\`\`\``,
    ];

    return response.join('\n');
  }

  throw new Error('Could not find server.');
};

export const command = 'list';
export const describe = 'List server config values';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getConfigList(args);
};
