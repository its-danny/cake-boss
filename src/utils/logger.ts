import { Client, Message, TextChannel } from 'discord.js';
import Server from '../entity/server';
import { EMOJI_ERROR_EVENT } from './emoji';

export const logEvent = async (client: Client, message: Message, string: string) => {
  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (server) {
    if (!server.config.logChannelId || server.config.logChannelId === '') {
      return;
    }

    const channel: TextChannel = client.channels.get(server.config.logChannelId) as TextChannel;

    if (channel) {
      channel.send(`${string}`);
    }
  }
};

export const logError = async (client: Client, message: Message, error: Error) => {
  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (server) {
    if (!server.config.logChannelId || server.config.logChannelId === '') {
      return;
    }

    const channel: TextChannel = client.channels.get(server.config.logChannelId) as TextChannel;

    if (channel) {
      channel.send(`>>> ${EMOJI_ERROR_EVENT} ${error.name}: ${error.message}`);
    }
  }
};
