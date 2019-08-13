import { getConnection, createConnections } from 'typeorm';
import { getEarned, Arguments } from './earned';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_CAKE } from '../../utils/emoji';

describe('commands/use/earned', () => {
  beforeAll(async done => {
    await createConnections();
    await getConnection('test');

    done();
  });

  it(`should let you know if you're not set up yet`, async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [] }),
      needsFetch: false,
      promisedOutput: null,
    };

    const response = await getEarned(args);
    expect(response).toMatchInlineSnapshot(`"You ain't got any!"`);

    done();
  });

  it(`should let you know if you're not set up yet`, async done => {
    const server = await createServer();
    const member = await createMember({ server, earned: 5 });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, senderId: member.discordId, serverMembers: [] }),
      needsFetch: false,
      promisedOutput: null,
    };

    const response = await getEarned(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_CAKE} You've earned a total of 5 cakes!"`);

    done();
  });
});
