import { Argv } from 'yargs';
import Table from 'cli-table';
import { canManage } from '../../../../utils/permissions';
import Server from '../../../../entity/server';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_CAKE } from '../../../../utils/emoji';
import getTableBorder from '../../../../utils/get-table-border';
import { CommandArguments } from '../../../../utils/command-arguments';

export const getConfigList = async (args: CommandArguments): Promise<string[] | string> => {
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
    chars: getTableBorder(),
  });

  table.push(['nickname', 'Nickname', server.config.nickname, 'CAKE BOSS!']);
  table.push(['cake-emoji', 'Emoji to use for cakes', server.config.cakeEmoji, EMOJI_CAKE]);
  table.push(['cake-name-singular', 'Name to use for cake (singular)', server.config.cakeNameSingular, 'cake']);
  table.push(['cake-name-plural', 'Name to use for cake (plural)', server.config.cakeNamePlural, 'cakes']);
  table.push([
    'drop-gifs',
    'List of GIfs to randomly choose from and post when a cake is dropped',
    server.config.dropGifs.join('\n'),
    '',
  ]);

  return `${server.config.cakeEmoji} **Branding Config**\n\n\`\`\`\n${table.toString()}\n\`\`\``;
};

export const command = 'branding';
export const describe = 'View branding config settings';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getConfigList(args);
};
