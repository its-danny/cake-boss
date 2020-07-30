import { Client, GuildMember, Message, Role, TextChannel } from "discord.js";

import Milestone from "../entity/milestone";
import Server from "../entity/server";
import { EMOJI_MILESTONE } from "./emoji";

export const logEvent = async (client: Client, message: Message, string: string) => {
  const server = await Server.findOne({
    where: { discordId: message.guild.id },
  });

  if (server) {
    if (!server.config.logChannelId || server.config.logChannelId === "") {
      return;
    }

    const channel: TextChannel = client.channels.get(server.config.logChannelId) as TextChannel;

    if (channel) {
      let eventMessage = string;

      if (server.config.logWithLink) {
        eventMessage += `\n${message.url}`;
      }

      channel.send(`\u200B${eventMessage}`);
    }
  }
};

export const logRedeemed = async (client: Client, message: Message, string: string) => {
  const server = await Server.findOne({
    where: { discordId: message.guild.id },
  });

  if (server) {
    if (!server.config.redeemChannelId || server.config.redeemChannelId === "") {
      return;
    }

    const channel: TextChannel = client.channels.get(server.config.redeemChannelId) as TextChannel;

    if (channel) {
      channel.send(`\u200B${string}`);
    }
  }
};

export const logMilestone = async (
  client: Client,
  message: Message,
  milestone: Milestone,
  discordMember: GuildMember,
  roles: Role[],
) => {
  const server = await Server.findOne({
    where: { discordId: message.guild.id },
  });

  if (server) {
    if (!server.config.milestoneChannelId || server.config.milestoneChannelId === "") {
      return;
    }

    const channel: TextChannel = client.channels.get(server.config.milestoneChannelId) as TextChannel;

    if (channel) {
      channel.send(
        `\u200B${EMOJI_MILESTONE} \`${discordMember.user.tag}\` reached ${milestone.amount} ${
          server.config.cakeNamePlural
        } and got the following roles: ${roles.map(role => role.name)}!`,
      );
    }
  }

  if (milestone.announcement) {
    message.channel.send(`${EMOJI_MILESTONE} <@${discordMember.id}> ${milestone.announcement}`);
  }
};
