import faker from 'faker';
import { Message, Guild, GuildMember, Client, TextChannel } from 'discord.js';
import Config from '../src/entity/config';
import Server from '../src/entity/server';
import User from '../src/entity/user';
import Member from '../src/entity/member';
import ShamedMember from '../src/entity/shamed-member';

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
  givenSinceReset?: number;
  shamed?: boolean;
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

  if (opts.givenSinceReset) {
    member.givenSinceReset = opts.givenSinceReset;
  }

  if (opts.shamed) {
    await member.save();

    const shamedMember = new ShamedMember();
    shamedMember.server = opts.server;
    shamedMember.member = member;

    await shamedMember.save();
  }

  return member.save();
};

export const createClient = (): Client => {
  return {} as Client;
};

export interface MessageOptions {
  server: Server;
  channel?: any;
  serverMembers?: Member[];
  serverChannels?: any[];
  senderId?: string;
  permission?: string;
}

export const createMessage = async (opts: MessageOptions): Promise<Message> => {
  return {
    guild: ({
      id: opts.server.discordId,

      members: {
        get(id: string) {
          if (opts.serverMembers) {
            const found = opts.serverMembers.find(m => m.discordId === id);

            if (found) {
              return {
                id: found.discordId,

                user: {
                  tag: `${found.discordId}#1234`,
                },
              };
            }
            return null;
          }
          return null;
        },
      },

      channels: {
        get(id: string) {
          if (opts.serverChannels) {
            const found = opts.serverChannels.find(channel => channel.id === id);

            if (found) {
              return {
                id: found.id,
                name: found.name,

                send() {},
              };
            }
            return null;
          }
          return null;
        },
      },

      fetchMembers() {},
    } as unknown) as Guild,

    author: {
      tag: `${faker.random.uuid()}#1234`,
    },

    channel: opts.channel ? opts.channel : null,

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

export const createChannel = (name?: string): TextChannel => {
  return {
    id: faker.random.uuid(),
    name: name || faker.internet.domainName(),
  } as TextChannel;
};
