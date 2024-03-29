import { createConnection, getConnection } from "typeorm";

import { Arguments, blessMember } from "@src/commands/use/bless";
import { CommandResponse } from "@src/utils/command-interfaces";
import { EMOJI_CAKE, EMOJI_INCORRECT_PERMISSIONS, EMOJI_RECORD_NOT_FOUND } from "@src/utils/emoji";
import { createClient, createMember, createMessage, createServer, ENTITIES } from "@test/test-helpers";

describe("commands/use/bless", () => {
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

  it(`should require permissions`, async (done) => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server }),
      member: "",
      role: "",
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await blessMember(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it(`should require a valid member`, async (done) => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: "ADMINISTRATOR" }),
      member: `<@12345>`,
      role: "<@12345>",
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await blessMember(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`);

    done();
  });

  it("should give them cake", async (done) => {
    const server = await createServer();
    const sender = await createMember({ server });
    const receiver = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({
        server,
        senderId: sender.discordId,
        serverMembers: [sender, receiver],
        permission: "ADMINISTRATOR",
      }),
      member: `<@${receiver.discordId}>`,
      role: `<@${receiver.discordId}>`,
      amount: 3,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await blessMember(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_CAKE} ${receiver.discordId} just got 3 cakes, <@${sender.discordId}>!`);

    await receiver.reload();
    expect(receiver.balance).toBe(3);
    expect(receiver.earned).toBe(3);

    done();
  });
});
