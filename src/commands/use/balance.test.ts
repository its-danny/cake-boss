import { getConnection, createConnections } from 'typeorm';
import { getBalance, Arguments } from './balance';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_CAKE } from '../../utils/emoji';

describe('commands/use/balance', () => {
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

    const response = await getBalance(args);
    expect(response).toMatchInlineSnapshot(`"You ain't got any!"`);

    done();
  });

  it(`should let you know if you're not set up yet`, async done => {
    const server = await createServer();
    const member = await createMember({ server, balance: 3 });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, senderId: member.discordId, serverMembers: [] }),
      needsFetch: false,
      promisedOutput: null,
    };

    const response = await getBalance(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_CAKE} Your current balance is 3 cakes!"`);

    done();
  });
});
