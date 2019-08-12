import { Argv } from 'yargs';
import { Client, Message, TextChannel } from 'discord.js';
import { canDrop } from '../../utils/permissions';
import Server from '../../entity/server';
import Drop from '../../entity/drop';
import { logEvent } from '../../utils/logger';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  channel: string;
  amount?: number;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
}

export const dropCakes = async (args: Arguments): Promise<string> => {
  if (!(await canDrop(args.message))) {
    return `😝 You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'drops'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const channelId = args.channel.replace(/^<#/, '').replace(/>$/, '');
  const discordChannel = args.message.guild.channels.get(channelId) as TextChannel;

  if (!discordChannel) {
    return `😢 Uh oh, I couldn't find that channel.`;
  }

  const amount = args.amount ? args.amount : 1;

  const drop = new Drop();
  drop.channelDiscordId = discordChannel.id;
  drop.amount = amount;
  await drop.save();

  server.drops.push(drop);
  await server.save();

  logEvent(
    args.client,
    args.message,
    `${server.config.cakeEmoji} \`@${args.message.author.tag}\` dropped ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    } in \`#${discordChannel.name}\`!`,
  );

  discordChannel.send(
    `😅 ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    } just dropped! \`+take\` it! ${server.config.cakeEmoji}`,
  );

  return '😁 Done!';
};

export const command = 'drop <channel> [amount]';
export const describe = 'Drop cakes in a channel';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = dropCakes(args);
};
