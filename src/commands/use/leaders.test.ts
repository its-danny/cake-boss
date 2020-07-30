import { createConnection, getConnection } from "typeorm";

import { createClient, createMember, createMessage, createServer, ENTITIES } from "../../../test/test-helpers";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";
import { EMOJI_CAKE, EMOJI_WORKING_HARD } from "../../utils/emoji";
import { getTopEarners } from "./leaders";

describe("commands/use/leaders", () => {
  beforeEach(async done => {
    await createConnection({
      type: "sqlite",
      database: ":memory:",
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

  it(`should let you know if there are no leaders`, async done => {
    const server = await createServer();

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await getTopEarners(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_WORKING_HARD} There are no top earners yet!`);

    done();
  });

  it(`should let you know if you're not set up yet`, async done => {
    const server = await createServer();

    const memberOne = await createMember({ server, earned: 1 });
    const memberTwo = await createMember({ server, earned: 2 });
    const memberThree = await createMember({ server, earned: 3 });

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await getTopEarners(args)) as CommandResponse;
    expect(response.content).toMatchInlineSnapshot(`
      "${EMOJI_CAKE} **Top Earners** 

      \`\`\`

            Member                                Earned 
      ────────────────────────────────────────────────────
        #1  ${memberThree.discordId}  3      
      ────────────────────────────────────────────────────
        #2  ${memberTwo.discordId}  2      
      ────────────────────────────────────────────────────
        #3  ${memberOne.discordId}  1      
      \`\`\`"
    `);

    done();
  });
});
