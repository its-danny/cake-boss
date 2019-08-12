import { Message } from 'discord.js';
import Server from '../entity/server';
import Member from '../entity/member';
import ShamedMember from '../entity/shamed-member';

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

export const canDrop = async (message: Message): Promise<boolean> => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    return true;
  }

  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (server) {
    return message.member.roles.some(role => server.config.dropperRoles.includes(role.name));
  }

  return false;
};

export const canGive = async (message: Message): Promise<boolean> => {
  const server = await Server.findOne({ where: { discordId: message.guild.id }, relations: ['config'] });

  if (server) {
    const member = await Member.findOne({ where: { discordId: message.member.id } });

    if (member) {
      return member.earned >= server.config.requirementToGive && member.givenSinceReset < server.config.giveLimit;
    }
  }

  return false;
};

export const isShamed = async (discordServerId: string, discordMemberId: string): Promise<boolean> => {
  const server = await Server.findOne({ where: { discordId: discordServerId } });

  if (server) {
    const member = await Member.findOne({ where: { discordId: discordMemberId } });

    if (member) {
      const shamed = await ShamedMember.findOne({ where: { server, member } });
      return shamed !== undefined;
    }
  }

  return false;
};

export const hasRole = (message: Message, roleName: string) => {
  return message.member.roles.find(role => role.name === roleName) !== null;
};
