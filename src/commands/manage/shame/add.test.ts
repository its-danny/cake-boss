import { createConnection, getConnection } from 'typeorm';
import Config from '../../../entity/config';
import Drop from '../../../entity/drop';
import Member from '../../../entity/member';
import Prize from '../../../entity/prize';
import Server from '../../../entity/server';
import ShamedMember from '../../../entity/shamed-member';
import User from '../../../entity/user';
import { createServer, createClient, createMessage, createMember } from '../../../../test/test-helpers';
import { shameMember, Arguments } from './add';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE, EMOJI_RECORD_NOT_FOUND } from '../../../utils/emoji';

describe('commands/manage/shamed/add', () => {
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

  it(`should require permissions`, async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server }),
      member: '<@12345>',
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await shameMember(args);
    expect(response).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it(`should require valid member`, async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: 'ADMINISTRATOR' }),
      member: '<@12345>',
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await shameMember(args);
    expect(response).toBe(`${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`);

    done();
  });

  it(`should shame a member`, async done => {
    const server = await createServer();
    const member = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [member], permission: 'ADMINISTRATOR' }),
      member: `<@${member.discordId}>`,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await shameMember(args);
    expect(response).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);
    await server.reload();
    expect(server.shamed).toHaveLength(1);

    done();
  });
});