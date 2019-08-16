import { createConnection, getConnection } from 'typeorm';
import { giveCakeToMember, Arguments } from './give';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND, EMOJI_CAKE, EMOJI_DONT_DO_THAT, EMOJI_WORKING_HARD } from '../../utils/emoji';
import Config from '../../entity/config';
import Drop from '../../entity/drop';
import Member from '../../entity/member';
import Server from '../../entity/server';
import Prize from '../../entity/prize';
import ShamedMember from '../../entity/shamed-member';
import User from '../../entity/user';

describe('commands/use/give', () => {
  beforeEach(async done => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Config, Drop, Member, Prize, Server, ShamedMember, User],
      synchronize: true,
      logging: false,
    });

    done();
  });

  afterEach(async done => {
    const conn = getConnection();
    await conn.close();

    done();
  });

  it(`should stop you if no-giving is enabled`, async done => {
    const server = await createServer({ noGiving: true });
    const sender = await createMember({ server });
    const receiver = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [sender, receiver], senderId: sender.discordId }),
      member: `<@${receiver.discordId}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await giveCakeToMember(args);
    expect(response).toBe(`${EMOJI_WORKING_HARD} You can't give ${server.config.cakeNamePlural}!`);

    done();
  })

  it(`should stop you if you're shamed`, async done => {
    const server = await createServer();
    const sender = await createMember({ server, shamed: true });
    const receiver = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [sender, receiver], senderId: sender.discordId }),
      member: `<@${receiver.discordId}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await giveCakeToMember(args);
    expect(response).toBe(
      `${EMOJI_DONT_DO_THAT} You have been **shamed** and can not give ${server.config.cakeNamePlural}!`,
    );

    done();
  });

  it(`should require a valid member`, async done => {
    const server = await createServer();
    const sender = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [sender], senderId: sender.discordId }),
      member: `<@12345>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await giveCakeToMember(args);
    expect(response).toBe(`${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`);

    done();
  });

  it(`shouldn't let you give to yourself`, async done => {
    const server = await createServer();
    const sender = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [sender], senderId: sender.discordId }),
      member: `<@${sender.discordId}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await giveCakeToMember(args);
    expect(response).toBe(`${EMOJI_DONT_DO_THAT} Don't be greedy!`);

    done();
  });

  it(`should stop you if they're shamed`, async done => {
    const server = await createServer();
    const sender = await createMember({ server });
    const receiver = await createMember({ server, shamed: true });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [sender, receiver], senderId: sender.discordId }),
      member: `<@${receiver.discordId}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await giveCakeToMember(args);
    expect(response).toBe(
      `${EMOJI_DONT_DO_THAT} They have been **shamed** and can not get ${server.config.cakeNamePlural}!`,
    );

    done();
  });

  it(`shoulds top you if you've hit your limit`, async done => {
    const server = await createServer();
    const sender = await createMember({ server, givenSinceReset: 5 });
    const receiver = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [sender, receiver], senderId: sender.discordId }),
      member: `<@${receiver.discordId}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await giveCakeToMember(args);
    expect(response).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You can't do that yet!`);

    done();
  });

  it('should give them cake', async done => {
    const server = await createServer();
    const sender = await createMember({ server });
    const receiver = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [sender, receiver], senderId: sender.discordId }),
      member: `<@${receiver.discordId}>`,
      amount: 3,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await giveCakeToMember(args);
    expect(response).toBe(`${EMOJI_CAKE} They just got 3 cakes, <@${args.message.member.id}>!`);

    await receiver.reload();
    expect(receiver.balance).toBe(3);
    expect(receiver.earned).toBe(3);

    done();
  });
});
