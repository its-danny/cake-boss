import { createConnection, getConnection } from "typeorm";

import { getBalance } from "@src/commands/use/balance";
import { CommandArguments, CommandResponse } from "@src/utils/command-interfaces";
import { EMOJI_CAKE } from "@src/utils/emoji";
import { createClient, createMember, createMessage, createServer, ENTITIES } from "@test/test-helpers";

describe("commands/use/balance", () => {
  beforeEach(async (done) => {
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

  afterEach(async (done) => {
    const conn = getConnection();
    await conn.close();

    done();
  });

  it(`should give you your balance`, async (done) => {
    const server = await createServer();
    const member = await createMember({ server, balance: 3 });

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, senderId: member.discordId }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await getBalance(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_CAKE} Your current balance is 3 cakes!`);

    done();
  });
});
