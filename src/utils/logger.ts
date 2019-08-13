import { Client, Message, TextChannel } from 'discord.js';
import Server from '../entity/server';

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
