import { createConnection, getConnection } from "typeorm";

import { createChannel, createClient, createMessage, createServer, ENTITIES } from "../../../test/test-helpers";
import Drop from "../../entity/drop";
import { CommandResponse } from "../../utils/command-interfaces";
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE } from "../../utils/emoji";
import { Arguments, dropCakes } from "./drop";

describe("commands/use/drop", () => {
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

  it(`should require permissions`, async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server }),
      channel: "<#12345>",
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await dropCakes(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it(`should drop cakes`, async done => {
    const server = await createServer();
    const channel = createChannel();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({
        server,
        serverChannels: [channel],
        permission: "ADMINISTRATOR",
      }),
      channel: `<#${channel.id}>`,
      amount: 1,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await dropCakes(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);

    const drop = await Drop.findOne({
      where: { server, channelDiscordId: channel.id },
    });
    expect(drop).toBeDefined();
    expect(drop!.amount).toBe(1);

    done();
  });
});
