import { createConnection, getConnection } from "typeorm";
import { createServer, createClient, createMessage, createMilestone, ENTITIES } from "../../../../test/test-helpers";
import { removeMilestone, Arguments } from "./remove";
import { EMOJI_ERROR, EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE } from "../../../utils/emoji";
import { CommandResponse } from "../../../utils/command-interfaces";

describe("commands/manage/milestone/remove", () => {
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

  it(`should require permissions`, async done => {
    const server = await createServer();
    const milestone = await createMilestone(server);

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server }),
      id: milestone.id,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {}
    };

    const response = (await removeMilestone(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it("should require a valid id", async done => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: "ADMINISTRATOR" }),
      id: 7,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {}
    };

    const response = (await removeMilestone(args)) as CommandResponse;
    expect(response.content).toBe(
      `${EMOJI_ERROR} Couldn't find that milestone, are you sure \`${args.id}\` is the right ID?`
    );

    done();
  });

  it("should remove the milestone", async done => {
    const server = await createServer();
    const milestone = await createMilestone(server);

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: "ADMINISTRATOR" }),
      id: milestone.id,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {}
    };

    const response = (await removeMilestone(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);
    await server.reload();
    expect(server.milestones).toHaveLength(0);

    done();
  });
});
