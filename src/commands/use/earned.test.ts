import { createConnection, getConnection } from "typeorm";
import { getEarned } from "./earned";
import { createServer, createMember, createMessage, createClient, ENTITIES } from "../../../test/test-helpers";
import { EMOJI_CAKE } from "../../utils/emoji";
import { CommandArguments, CommandResponse } from "../../utils/command-interfaces";

describe("commands/use/earned", () => {
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

  it(`should let you how much you've earned over time`, async done => {
    const server = await createServer();
    const member = await createMember({ server, earned: 5 });

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, senderId: member.discordId }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {}
    };

    const response = (await getEarned(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_CAKE} You have earned a total of 5 cakes!`);

    done();
  });
});
