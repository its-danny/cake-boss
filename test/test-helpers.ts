import faker from 'faker';
import { Message, Guild, GuildMember, Client, TextChannel, Role } from 'discord.js';
import Config from '../src/entity/config';
import Drop from '../src/entity/drop';
import Server from '../src/entity/server';
import User from '../src/entity/user';
import Member from '../src/entity/member';
import Prize from '../src/entity/prize';
import Milestone from '../src/entity/milestone';

export const ENTITIES = [Config, Drop, Member, Milestone, Prize, Server, User];

export interface ServerOptions {
  noGiving?: boolean;
}

export const createServer = async (opts?: ServerOptions): Promise<Server> => {
  const config = new Config();

  if (opts && opts.noGiving) {
    config.noGiving = opts.noGiving;
  }

  await config.save();

  const server = new Server();
  server.discordId = faker.random.uuid();
  server.config = config;

  return server.save();
};

export const createPrize = async (server: Server): Promise<Prize> => {
  const prize = new Prize();
  prize.server = server;

  return prize.save();
};

export const createMilestone = async (server: Server): Promise<Milestone> => {
  const milestone = new Milestone();
  milestone.server = server;

  return milestone.save();
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
  given?: number;
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

  if (opts.given) {
    member.given = opts.given;
  }

  if (opts.givenSinceReset) {
    member.givenSinceReset = opts.givenSinceReset;
  }

  if (opts.shamed) {
    member.shamed = true;
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
  serverRoles?: Role[];
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
                displayName: found.discordId,

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

      roles: opts.serverRoles ? opts.serverRoles : [],
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
