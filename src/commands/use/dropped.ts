import { Argv } from 'yargs';
import Table from 'cli-table';
import { canDrop } from '../../utils/permissions';
import Server from '../../entity/server';
import { EMOJI_INCORRECT_PERMISSIONS } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';
import getTableBorder from '../../utils/get-table-border';

export const getDropList = async (args: CommandArguments): Promise<string> => {
  if (!(await canDrop(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const table = new Table({
    head: ['Channel', 'Amount'],
    style: { head: [], border: [] },
    chars: getTableBorder(),
  });

  const dropped: { [key: string]: number } = {};

  server.drops.forEach(drop => {
    const channel = args.message.guild.channels.get(drop.channelDiscordId);

    if (channel) {
      if (Object.prototype.hasOwnProperty.call(dropped, channel.name)) {
        dropped[channel.name] += drop.amount;
      } else {
        dropped[channel.name] = drop.amount;
      }
    }
  });

  Object.keys(dropped)
    .sort((a, b) => dropped[b] - dropped[a])
    .forEach(channel => table.push([`#${channel}`, dropped[channel]]));

  return `${server.config.cakeEmoji} **Dropped ${
    server.config.cakeNamePlural
  }** \n\n\`\`\`\n\n${table.toString()}\n\`\`\``;
};

export const command = 'dropped';
export const describe = 'View dropped cakes';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.promisedOutput = getDropList(args);
};
