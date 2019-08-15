import { getConnection, createConnections } from 'typeorm';
import moment from 'moment';
import { getLedger } from './ledger';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_CAKE, EMOJI_WORKING_HARD, EMOJI_INCORRECT_PERMISSIONS } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';

describe('commands/use/ledger', () => {
  beforeAll(async done => {
    await createConnections();
    await getConnection('test');

    done();
  });

  it(`should require permissions`, async done => {
    const server = await createServer();

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [] }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await getLedger(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!"`);

    done();
  });

  it(`should let you know if there are no members set up yet`, async done => {
    const server = await createServer();

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [], permission: 'ADMINISTRATOR' }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await getLedger(args);
    expect(response).toMatchInlineSnapshot(`"${EMOJI_WORKING_HARD} Nobody has cakes yet!"`);

    done();
  });

  it(`should show you the ledger`, async done => {
    const server = await createServer();

    const memberOne = await createMember({ server, earned: 1 });
    const memberTwo = await createMember({ server, earned: 2 });
    const memberThree = await createMember({ server, earned: 3 });

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, serverMembers: [], permission: 'ADMINISTRATOR' }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = await getLedger(args);
    expect(response).toMatchInlineSnapshot(`
      "${EMOJI_CAKE} **Ledger** 

      \`\`\`

        Member                                Balance  Earned  Date Added       
      ────────────────────────────────────────────────────────────────────────────
        ${memberOne.discordId}  0        1       ${moment().format('MMMM Do YYYY')} 
      ────────────────────────────────────────────────────────────────────────────
        ${memberTwo.discordId}  0        2       ${moment().format('MMMM Do YYYY')} 
      ────────────────────────────────────────────────────────────────────────────
        ${memberThree.discordId}  0        3       ${moment().format('MMMM Do YYYY')} 
      \`\`\`"
    `);

    done();
  });
});
