import { getConnection, createConnections } from 'typeorm';
import { disappearCakes, Arguments } from './disappear';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND, EMOJI_JOB_WELL_DONE } from '../../utils/emoji';

describe('commands/use/disappear', () => {
  beforeAll(async done => {
    await createConnections();
    await getConnection('test');

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

    const response = await disappearCakes(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!"`);

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

    const response = await disappearCakes(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them."`);

    done();
  });

  it(`should remove from balance and earnings`, async done => {
    const server = await createServer();
    const member = await createMember({ server, balance: 5, earned: 10 });

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

    const response = await disappearCakes(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_JOB_WELL_DONE} Done!"`);

    await member.reload();
    expect(member.balance).toMatchInlineSnapshot(`4`);
    expect(member.earned).toMatchInlineSnapshot(`9`);

    done();
  });
});
