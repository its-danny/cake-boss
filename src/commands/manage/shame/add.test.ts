import { createConnection, getConnection } from "typeorm";

import { createClient, createMember, createMessage, createServer, ENTITIES } from "../../../../test/test-helpers";
import { CommandResponse } from "../../../utils/command-interfaces";
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_JOB_WELL_DONE, EMOJI_RECORD_NOT_FOUND } from "../../../utils/emoji";
import { Arguments, shameMember } from "./add";

describe("commands/manage/shamed/add", () => {
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
      member: "<@12345>",
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await shameMember(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it(`should require valid member`, async (done) => {
    const server = await createServer();

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({ server, permission: "ADMINISTRATOR" }),
      member: "<@12345>",
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await shameMember(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_RECORD_NOT_FOUND} Uh oh, I couldn't find them.`);

    done();
  });

  it(`should shame a member`, async (done) => {
    const server = await createServer();
    const member = await createMember({ server });

    const args: Arguments = {
      client: createClient(),
      message: await createMessage({
        server,
        serverMembers: [member],
        permission: "ADMINISTRATOR",
      }),
      member: `<@${member.discordId}>`,
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await shameMember(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_JOB_WELL_DONE} Done!`);
    await member.reload();
    expect(member.shamed).toBe(true);

    done();
  });
});
