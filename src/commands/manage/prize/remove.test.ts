import { createConnection, getConnection } from "typeorm";

import {
  createChannel,
  createClient,
  createMessage,
  createPrize,
  createServer,
  ENTITIES,
} from "../../../../test/test-helpers";
import { CommandResponse } from "../../../utils/command-interfaces";
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE } from "../../../utils/emoji";
import { Arguments, removePrize } from "./remove";

describe("commands/manage/prize/remove", () => {
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
    const prize = await createPrize(server);

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server }),
      id: prize.id,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await removePrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it("should require redeem-channel being set", async (done) => {
    const server = await createServer();
    const prize = await createPrize(server);

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: "ADMINISTRATOR" }),
      id: prize.id,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await removePrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_ERROR} You need to set the \`redeem-channel\` config before using prizes.`);

    done();
  });

  it("should require a valid id", async (done) => {
    const server = await createServer();
    const channel = createChannel("redeem");

    server.config.redeemChannelId = channel.id;
    await server.config.save();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({
        server,
        serverChannels: [channel],
        permission: "ADMINISTRATOR",
      }),
      id: 7,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await removePrize(args)) as CommandResponse;
    expect(response.content).toBe(
      `${EMOJI_ERROR} Couldn't find that prize, are you sure \`${args.id}\` is the right ID?`,
    );

    done();
  });

  it("should remove the prize", async (done) => {
    const server = await createServer();
    const channel = createChannel("redeem");
    const prize = await createPrize(server);

    server.config.redeemChannelId = channel.id;
    await server.config.save();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({
        server,
        serverChannels: [channel],
        permission: "ADMINISTRATOR",
      }),
      id: prize.id,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await removePrize(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);
    await server.reload();
    expect(server.prizes).toHaveLength(0);

    done();
  });
});
