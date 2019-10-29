import { createConnection, getConnection } from 'typeorm';
import { createServer, createClient, createMessage, createChannel, ENTITIES } from '../../../../test/test-helpers';
import { addPrize, Arguments } from './add';
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE } from '../../../utils/emoji';
import { CommandResponse } from '../../../utils/command-interfaces';

describe('commands/manage/prize/add', () => {
  beforeEach(async done => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: ENTITIES,
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
      description: 'A hellhound',
      reactionEmoji: '🐺',
      price: 3,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addPrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it('should require redeem-channel being set', async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: 'ADMINISTRATOR' }),
      description: 'A hellhound',
      reactionEmoji: '🐺',
      price: 3,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addPrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_ERROR} You need to set the \`redeem-channel\` config before using prizes.`);

    done();
  });

  it('should require description', async done => {
    const server = await createServer();
    const channel = createChannel('redeem');

    server.config.redeemChannelId = channel.id;
    await server.config.save();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverChannels: [channel], permission: 'ADMINISTRATOR' }),
      description: '',
      reactionEmoji: '🐺',
      price: 3,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addPrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_ERROR} Description required!`);

    done();
  });

  it('should require reaction emoji', async done => {
    const server = await createServer();
    const channel = createChannel('redeem');

    server.config.redeemChannelId = channel.id;
    await server.config.save();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverChannels: [channel], permission: 'ADMINISTRATOR' }),
      description: 'A hellhound',
      reactionEmoji: '',
      price: 3,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addPrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_ERROR} Reaction emoji required!`);

    done();
  });

  it('should require price of 1 or more', async done => {
    const server = await createServer();
    const channel = createChannel('redeem');

    server.config.redeemChannelId = channel.id;
    await server.config.save();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverChannels: [channel], permission: 'ADMINISTRATOR' }),
      description: 'A hellhound',
      reactionEmoji: '🐺',
      price: 0,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addPrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_ERROR} Price must be 1 or more!`);

    done();
  });

  it('should add the prize', async done => {
    const server = await createServer();
    const channel = createChannel('redeem');

    server.config.redeemChannelId = channel.id;
    await server.config.save();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverChannels: [channel], permission: 'ADMINISTRATOR' }),
      description: 'A hellhound',
      reactionEmoji: '🐺',
      price: 10,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addPrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);
    await server.reload();
    expect(server.prizes).toHaveLength(1);

    done();
  });
});
