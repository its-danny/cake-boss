import { createConnection, getConnection } from 'typeorm';
import { Role } from 'discord.js';
import { createServer, createClient, createMessage, ENTITIES } from '../../../../test/test-helpers';
import { addMilestone, Arguments } from './add';
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE } from '../../../utils/emoji';
import { CommandResponse } from '../../../utils/command-interfaces';

describe('commands/manage/milestone/add', () => {
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
      amount: 3,
      roles: 'Cool Dude',
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addMilestone(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it('should require amount of 1 or more', async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: 'ADMINISTRATOR' }),
      amount: 0,
      roles: 'Cool Dude',
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addMilestone(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_ERROR} Amount must be 1 or more!`);

    done();
  });

  it('should require 1 or more roles', async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: 'ADMINISTRATOR' }),
      amount: 3,
      roles: '',
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addMilestone(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_ERROR} Must give 1 or more valid roles!`);

    done();
  });

  it('should add the milestone', async done => {
    const server = await createServer();

    const role = { id: '123', name: 'Cool Dude' } as Role;

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverRoles: [role], permission: 'ADMINISTRATOR' }),
      amount: 3,
      roles: 'Cool Dude',
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await addMilestone(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);
    await server.reload();
    expect(server.milestones).toHaveLength(1);

    done();
  });
});
