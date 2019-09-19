import { createConnection, getConnection } from 'typeorm';
import { dropCakes, Arguments } from './drop';
import { createServer, createMessage, createClient, createChannel } from '../../../test/test-helpers';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE } from '../../utils/emoji';
import Config from '../../entity/config';
import Drop from '../../entity/drop';
import Member from '../../entity/member';
import Server from '../../entity/server';
import Prize from '../../entity/prize';
import User from '../../entity/user';
import { CommandResponse } from '../../utils/command-interfaces';

describe('commands/use/drop', () => {
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

  it(`should require permissions`, async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server }),
      channel: '<#12345>',
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await dropCakes(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it(`should drop cakes`, async done => {
    const server = await createServer();
    const channel = createChannel();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverChannels: [channel], permission: 'ADMINISTRATOR' }),
      channel: `<#${channel.id}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await dropCakes(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);

    const drop = await Drop.findOne({ where: { server, channelDiscordId: channel.id }, cache: true });
    expect(drop).toBeDefined();
    expect(drop!.amount).toBe(1);

    done();
  });
});
