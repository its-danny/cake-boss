import faker from 'faker';
import { Message, Guild, GuildMember, Client } from 'discord.js';
import Config from '../src/entity/config';
import Server from '../src/entity/server';
import User from '../src/entity/user';
import Member from '../src/entity/member';

export const createServer = async (): Promise<Server> => {
  const config = new Config();
  await config.save();

  const server = new Server();
  server.discordId = faker.random.uuid();
  server.config = config;

  return server.save();
};

export const createUser = async (): Promise<User> => {
  const user = new User();
  user.discordId = faker.random.uuid();

  return user.save();
};

export interface MemberOptions {
  server: Server;
  discordId?: string;
  balance?: number;
  earned?: number;
}

export const createMember = async (opts: MemberOptions): Promise<Member> => {
  const user = await createUser();

  const member = new Member();
  member.server = opts.server;
  member.user = user;

  if (opts.discordId) {
    member.discordId = opts.discordId;
  } else {
    member.discordId = faker.random.uuid();
  }

  if (opts.balance) {
    member.balance = opts.balance;
  }

  if (opts.earned) {
    member.earned = opts.earned;
  }

  return member.save();
};

export const createClient = (): Client => {
  return {} as Client;
};

export interface MessageOptions {
  server: Server;
  serverMembers: Member[];
  senderId?: string;
  permission?: string;
}

export const createMessage = async (opts: MessageOptions): Promise<Message> => {
  return {
    guild: ({
      id: opts.server.discordId,

      members: {
        get(id: string) {
          const found = opts.serverMembers.find(m => m.discordId === id);

          if (found) {
            return {
              id: found.discordId,

              user: {
                tag: `${found.discordId}#1234`,
              },
            };
          }
        },
      },

      fetchMembers() {},
    } as unknown) as Guild,

    author: {
      tag: `${faker.random.uuid()}#1234`,
    },

    member: ({
      id: opts.senderId ? opts.senderId : faker.random.uuid(),
      roles: [],

      hasPermission(permission: string) {
        if (opts.permission) {
          return permission === opts.permission;
        }
        return false;
      },
    } as unknown) as GuildMember,
  } as Message;
};
