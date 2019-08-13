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

  table.push([
    'requirement-to-give',
    'How much cake someone has to earn before giving',
    server.config.requirementToGive,
    0,
  ]);

  table.push(['give-limit', 'How many cakes someone can give in a cycle (min: 1)', server.config.giveLimit, 5]);
  table.push(['give-limit-hour-reset', 'How many hours are in a cycle (min: 1)', server.config.giveLimitHourReset, 1]);

  return `${server.config.cakeEmoji} **Usage Config**\n\n\`\`\`\n${table.toString()}\n\`\`\``;
};

export const command = 'usage';
export const describe = 'View usage config settings';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = getConfigList(args);
};