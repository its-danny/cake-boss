import { Message } from "discord.js";

import Member from "../entity/member";
import Server from "../entity/server";

export const canManage = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    return true;
  }

  const server = await Server.findOne({
    where: { discordId: message.guild.id },
  });

  if (server) {
    return message.member.roles.some(role => server.config.managerRoleIds.includes(role.id));
  }

  return false;
};

export const canBless = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    return true;
  }

  if (await canManage(message)) {
    return true;
  }

  const server = await Server.findOne({
    where: { discordId: message.guild.id },
  });

  if (server) {
    return message.member.roles.some(role => server.config.blesserRoleIds.includes(role.id));
  }

  return false;
};

export const canDrop = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    return true;
  }

  if (await canManage(message)) {
    return true;
  }

  const server = await Server.findOne({
    where: { discordId: message.guild.id },
  });

  if (server) {
    return message.member.roles.some(role => server.config.dropperRoleIds.includes(role.id));
  }

  return false;
};

export const canGive = async (message: Message): Promise<boolean> => {
  const server = await Server.findOne({
    where: { discordId: message.guild.id },
  });

  if (server) {
    const member = await Member.findOne({
      where: { discordId: message.member.id },
    });

    if (member) {
      return member.earned >= server.config.requirementToGive && member.givenSinceReset < server.config.giveLimit;
    }
  }

  return false;
};

export const isShamed = async (discordServerId: string, discordMemberId: string): Promise<boolean> => {
  const server = await Server.findOne({
    where: { discordId: discordServerId },
  });

  if (server) {
    const member = await Member.findOne({
      where: { discordId: discordMemberId },
    });

    if (member) {
      return member.shamed;
    }
  }

  return false;
};

export const hasRole = (message: Message, roleName: string) => {
  return message.member.roles.find(role => role.name === roleName) !== null;
};
