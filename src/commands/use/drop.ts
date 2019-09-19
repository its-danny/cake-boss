import { Argv } from 'yargs';
import { TextChannel } from 'discord.js';
import { sample, isEmpty } from 'lodash';
import { canDrop } from '../../utils/permissions';
import Server from '../../entity/server';
import Drop from '../../entity/drop';
import { logEvent } from '../../utils/logger';
import {
  EMOJI_INCORRECT_PERMISSIONS,
  EMOJI_RECORD_NOT_FOUND,
  EMOJI_JOB_WELL_DONE,
  EMOJI_WORKING_HARD,
  EMOJI_ERROR,
} from '../../utils/emoji';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';

export interface Arguments extends CommandArguments {
  channel: string;
  amount?: number;
}

export const dropCakes = async (args: Arguments): Promise<CommandResponse | void> => {
  if (!(await canDrop(args.message))) {
    return { content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!` };
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id }, cache: true });

  if (!server) {
    throw new Error('Could not find server.');
  }

  const channelId = args.channel.replace(/^<#/, '').replace(/>$/, '');
  const discordChannel = args.message.guild.channels.get(channelId) as TextChannel;

  if (!discordChannel) {
    return { content: `${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find that channel.` };
  }

  const amount = args.amount ? args.amount : 1;

  if (!Number.isInteger(amount) && amount <= 0) {
    return { content: `${EMOJI_ERROR} Invalid amount, sorry!` };
  }

  const drop = new Drop();
  drop.channelDiscordId = discordChannel.id;
  drop.amount = amount;
  await drop.save();

  server.drops.push(drop);
  await server.save();

  logEvent(
    args.client,
    args.message,
    `${server.config.cakeEmoji} \`${args.message.author.tag}\` dropped ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    } in \`#${discordChannel.name}\`!`,
  );

  discordChannel.send(
    `\u200B${EMOJI_WORKING_HARD} ${server.config.cakeEmoji} ${amount} ${
      amount > 1 ? server.config.cakeNamePlural : server.config.cakeNameSingular
    } just dropped! \`${server.config.commandPrefix}take\` it!\n${
      !isEmpty(server.config.dropGifs) ? sample(server.config.dropGifs) : ''
    }`,
  );

  if (server.config.quietMode) {
    args.message.react(EMOJI_JOB_WELL_DONE);

    return undefined;
  }

  return { content: `${EMOJI_JOB_WELL_DONE} Done!` };
};

export const command = 'drop <channel> [amount]';
export const describe = 'Drop cakes in a channel';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = dropCakes(args);
};
