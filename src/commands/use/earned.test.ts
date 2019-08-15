import { getConnection, createConnections } from 'typeorm';
import { getEarned } from './earned';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_CAKE } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';

describe('commands/use/earned', () => {
  beforeAll(async done => {
    await createConnections();
    await getConnection('test');

    done();
  });

  it(`should let you how much you've earned over time`, async done => {
    const server = await createServer();
    const member = await createMember({ server, earned: 5 });

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, senderId: member.discordId, serverMembers: [] }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await getEarned(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_CAKE} You've earned a total of 5 cakes!"`);

    done();
  });
});
