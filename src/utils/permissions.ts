import { Message } from 'discord.js';
import Server from '../entity/server';
import Member from '../entity/member';

export const canManage = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    return true;
  }

  const server = await Server.findOne({ where: { discordId: message.guild.id }, cache: true });

  if (server) {
    return message.member.roles.some(role => server.config.managerRoleIds.includes(role.id));
  }

  return false;
};

export const canBless = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    return true;
  }

  if (await canManage(message)) {
    return true;
  }

  const server = await Server.findOne({ where: { discordId: message.guild.id }, cache: true });

  if (server) {
    return message.member.roles.some(role => server.config.blesserRoleIds.includes(role.id));
  }

  return false;
};

export const canDrop = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    return true;
  }

  if (await canManage(message)) {
    return true;
  }

  const server = await Server.findOne({ where: { discordId: message.guild.id }, cache: true });

  if (server) {
    return message.member.roles.some(role => server.config.dropperRoleIds.includes(role.id));
  }

  return false;
};

export const canGive = async (message: Message): Promise<boolean> => {
  const server = await Server.findOne({ where: { discordId: message.guild.id }, cache: true });

  if (server) {
    const member = await Member.findOne({ where: { discordId: message.member.id }, cache: true });

    if (member) {
      return member.earned >= server.config.requirementToGive && member.givenSinceReset < server.config.giveLimit;
    }
  }

  return false;
};

export const isShamed = async (discordServerId: string, discordMemberId: string): Promise<boolean> => {
  const server = await Server.findOne({ where: { discordId: discordServerId }, cache: true });

  if (server) {
    const member = await Member.findOne({ where: { discordId: discordMemberId }, cache: true });

    if (member) {
      return member.shamed;
    }
  }

  return false;
};

export const hasRole = (message: Message, roleName: string) => {
  return message.member.roles.find(role => role.name === roleName) !== null;
};
