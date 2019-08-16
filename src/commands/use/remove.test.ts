import { createConnection, getConnection } from 'typeorm';
import { removeCakes, Arguments } from './remove';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND, EMOJI_JOB_WELL_DONE } from '../../utils/emoji';
import Config from '../../entity/config';
import Drop from '../../entity/drop';
import Member from '../../entity/member';
import Server from '../../entity/server';
import Prize from '../../entity/prize';
import ShamedMember from '../../entity/shamed-member';
import User from '../../entity/user';

describe('commands/use/remove', () => {
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
      message: await createMessage({ server, serverMembers: [] }),
      member: '',
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await removeCakes(args);
    expect(response).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it(`should require a valid member`, async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [], permission: 'ADMINISTRATOR' }),
      member: `<@12345>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await removeCakes(args);
    expect(response).toBe(`${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`);

    done();
  });

  it(`should remove from balance`, async done => {
    const server = await createServer();
    const member = await createMember({ server, balance: 5 });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [member], permission: 'ADMINISTRATOR' }),
      member: `<@${member.discordId}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await removeCakes(args);
    expect(response).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);

    await member.reload();
    expect(member.balance).toBe(4);

    done();
  });
});
