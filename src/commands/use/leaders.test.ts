import { getConnection, createConnections } from 'typeorm';
import { getLeaderboard, Arguments } from './leaders';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_CAKE, EMOJI_WORKING_HARD } from '../../utils/emoji';

describe('commands/use/leaders', () => {
  beforeAll(async done => {
    await createConnections();
    await getConnection('test');

    done();
  });

  it(`should let you know if there are no leaders`, async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [] }),
      needsFetch: false,
      promisedOutput: null,
    };

    const response = await getLeaderboard(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_WORKING_HARD} There are no leaders yet!"`);

    done();
  });

  it(`should let you know if you're not set up yet`, async done => {
    const server = await createServer();

    const memberOne = await createMember({ server, earned: 1 });
    const memberTwo = await createMember({ server, earned: 2 });
    const memberThree = await createMember({ server, earned: 3 });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [] }),
      needsFetch: false,
      promisedOutput: null,
    };

    const response = await getLeaderboard(args);
    expect(response).toMatchInlineSnapshot(`
      "${EMOJI_CAKE} **Leaders!** 

      \`\`\`

      ┌────┬──────────────────────────────────────┬────────┐
      │    │ Member                               │ Earned │
      ├────┼──────────────────────────────────────┼────────┤
      │ #1 │ ${memberThree.discordId} │ 3      │
      ├────┼──────────────────────────────────────┼────────┤
      │ #2 │ ${memberTwo.discordId} │ 2      │
      ├────┼──────────────────────────────────────┼────────┤
      │ #3 │ ${memberOne.discordId} │ 1      │
      └────┴──────────────────────────────────────┴────────┘
      \`\`\`"
    `);

    done();
  });
});
