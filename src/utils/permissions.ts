import { Message } from 'discord.js';
import Server from '../entity/server';

export const canManage = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    return true;
  }

  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (server) {
    return message.member.roles.some(role => server.config.managerRoles.includes(role.name));
  }

  return false;
};

export const canBless = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    return true;
  }

  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (server) {
    return message.member.roles.some(role => server.config.blesserRoles.includes(role.name));
  }

  return false;
};

export const hasRole = (message: Message, roleName: string) => {
  return message.member.roles.find(role => role.name === roleName) !== null;
};
