import { createConnection, getConnection } from 'typeorm';
import { takeCake } from './take';
import { createServer, createMessage, createClient, createChannel, createMember } from '../../../test/test-helpers';
import { EMOJI_JOB_WELL_DONE, EMOJI_DONT_DO_THAT, EMOJI_RECORD_NOT_FOUND } from '../../utils/emoji';
import Config from '../../entity/config';
import Drop from '../../entity/drop';
import Member from '../../entity/member';
import Server from '../../entity/server';
import Prize from '../../entity/prize';
import User from '../../entity/user';
import { CommandArguments } from '../../utils/command-arguments';

describe('commands/use/take', () => {
  beforeEach(async done => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Config, Drop, Member, Prize, Server, User],
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

  it(`should stop you if you're shamed`, async done => {
    const server = await createServer();
    const member = await createMember({ server, shamed: true });
    const channel = createChannel();

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, channel, serverMembers: [member], senderId: member.discordId }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await takeCake(args);
    expect(response).toBe(
      `${EMOJI_DONT_DO_THAT} You have been **shamed** and can not get ${server.config.cakeNamePlural}!`,
    );

    done();
  });

  it(`should tell you if there's no cakes dropped`, async done => {
    const server = await createServer();
    const channel = createChannel();

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, channel }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await takeCake(args);
    expect(response).toBe(`${EMOJI_RECORD_NOT_FOUND} There are no drops here!`);

    done();
  });

  it(`should take the cake`, async done => {
    const server = await createServer();
    const member = await createMember({ server });
    const channel = createChannel();

    const drop = new Drop();
    drop.server = server;
    drop.channelDiscordId = channel.id;
    drop.amount = 2;
    await drop.save();

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, senderId: member.discordId, channel, serverChannels: [channel] }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await takeCake(args);
    expect(response).toBe(`${EMOJI_JOB_WELL_DONE} ${server.config.cakeEmoji} You got it, <@${member.discordId}>!`);

    await drop.reload();
    expect(drop.amount).toBe(1);

    await member.reload();
    expect(member.balance).toBe(1);
    expect(member.earned).toBe(1);

    done();
  });
});
