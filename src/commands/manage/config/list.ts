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
  promisedOutput: Promise<string[] | string> | null;
}

export const getConfigList = async (args: Arguments): Promise<string[] | string> => {
  if (!(await canManage(args.message))) {
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, relations: ['config'] });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const systemTable = new Table({
    head: ['Name', 'Description', 'Value', 'Default'],
    style: { head: [], border: [] },
  });

  systemTable.push(['command-prefix', `It's the command prefix!`, server.config.commandPrefix, '-']);
  systemTable.push(['log-channel', 'Where to log events', server.config.logChannelId, '']);

  systemTable.push([
    'manager-roles',
    'Roles allowed to manage Cake Boss (comma-separated)',
    server.config.managerRoles.join(', '),
    '',
  ]);

  systemTable.push([
    'blesser-roles',
    'Roles allowed to bless others with cake (comma-separated)',
    server.config.blesserRoles.join(', '),
    '',
  ]);

  systemTable.push([
    'dropper-roles',
    'Roles allowed to drop cakes in channels (comma-separated)',
    server.config.dropperRoles.join(', '),
    '',
  ]);

  const brandingTable = new Table({
    head: ['Name', 'Description', 'Value', 'Default'],
    style: { head: [], border: [] },
  });

  brandingTable.push(['cake-emoji', 'Emoji to use for cakes', server.config.cakeEmoji, '🍰']);
  brandingTable.push(['cake-name-singular', 'Name to use for cake (singular)', server.config.cakeNameSingular, 'cake']);
  brandingTable.push(['cake-name-plural', 'Name to use for cake (plural)', server.config.cakeNamePlural, 'cakes']);

  const usageTable = new Table({
    head: ['Name', 'Description', 'Value', 'Default'],
    style: { head: [], border: [] },
  });

  usageTable.push([
    'requirement-to-give',
    'How much cake someone has to earn before giving',
    server.config.requirementToGive,
    0,
  ]);

  usageTable.push(['give-limit', 'How many cakes someone can give in a cycle (min: 1)', server.config.giveLimit, 5]);
  usageTable.push([
    'give-limit-hour-reset',
    'How many hours are in a cycle (min: 1)',
    server.config.giveLimitHourReset,
    1,
  ]);

  return [
    `\n\`\`\`\nSystem\n${systemTable.toString()}\n\`\`\``,
    `\n\`\`\`\nBranding\n${brandingTable.toString()}\n\`\`\``,
    `\n\`\`\`\nUsage\n${usageTable.toString()}\n\`\`\``,
  ];
};

export const command = 'list';
export const describe = 'List server config values';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getConfigList(args);
};
