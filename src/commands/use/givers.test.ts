import { createConnection, getConnection } from "typeorm";
import { getTopGivers } from "./givers";
import { createServer, createMember, createMessage, createClient, ENTITIES } from "../../../test/test-helpers";
import { EMOJI_CAKE, EMOJI_WORKING_HARD } from "../../utils/emoji";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";

describe("commands/use/givers", () => {
  beforeEach(async done => {
    await createConnection({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: ENTITIES,
      synchronize: true,
      logging: false
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
      reactions: {}
    };

    const response = (await getTopGivers(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_WORKING_HARD} There are no top givers yet!`);

    done();
  });

  it(`should let you know if you're not set up yet`, async done => {
    const server = await createServer();

    const memberOne = await createMember({ server, given: 1 });
    const memberTwo = await createMember({ server, given: 2 });
    const memberThree = await createMember({ server, given: 3 });

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {}
    };

    const response = (await getTopGivers(args)) as CommandResponse;
    expect(response.content).toMatchInlineSnapshot(`
      "${EMOJI_CAKE} **Top Givers** 

      \`\`\`

            Member                                Given 
      ───────────────────────────────────────────────────
        #1  ${memberThree.discordId}  3     
      ───────────────────────────────────────────────────
        #2  ${memberTwo.discordId}  2     
      ───────────────────────────────────────────────────
        #3  ${memberOne.discordId}  1     
      \`\`\`"
    `);

    done();
  });
});
