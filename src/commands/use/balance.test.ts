import { getConnection, createConnections } from 'typeorm';
import { getBalance } from './balance';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_CAKE } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';

describe('commands/use/balance', () => {
  beforeAll(async done => {
    await createConnections();
    await getConnection('test');

    done();
  });

  it(`should give you your balance`, async done => {
    const server = await createServer();
    const member = await createMember({ server, balance: 3 });

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, senderId: member.discordId, serverMembers: [] }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await getBalance(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_CAKE} Your current balance is 3 cakes!"`);

    done();
  });
});
