import { createConnection, getConnection } from 'typeorm';
import { getDropList } from './dropped';
import { createServer, createMessage, createClient, createChannel } from '../../../test/test-helpers';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_CAKE } from '../../utils/emoji';
import Config from '../../entity/config';
import Drop from '../../entity/drop';
import Member from '../../entity/member';
import Server from '../../entity/server';
import Prize from '../../entity/prize';
import User from '../../entity/user';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';

describe('commands/use/dropped', () => {
  beforeEach(async done => {
    await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Config, Drop, Member, Prize, Server, User],
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

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await getDropList(args)) as CommandResponse;
    expect(response.content).toBe(`${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`);

    done();
  });

  it(`should return the drop list`, async done => {
    const server = await createServer();
    const channelOne = createChannel('general');
    const channelTwo = createChannel('games');

    const dropOne = new Drop();
    dropOne.server = server;
    dropOne.channelDiscordId = channelOne.id;
    dropOne.amount = 2;
    await dropOne.save();

    const dropTwo = new Drop();
    dropTwo.server = server;
    dropTwo.channelDiscordId = channelOne.id;
    dropTwo.amount = 5;
    await dropTwo.save();

    const dropThree = new Drop();
    dropThree.server = server;
    dropThree.channelDiscordId = channelTwo.id;
    dropThree.amount = 1;
    await dropThree.save();

    const args: CommandArguments = {
      client: createClient(),
      message: await createMessage({ server, serverChannels: [channelOne, channelTwo], permission: 'ADMINISTRATOR' }),
      needsFetch: false,
      careAboutQuietMode: false,
      promisedOutput: null,
      reactions: {},
    };

    const response = (await getDropList(args)) as CommandResponse;
    expect(response.content).toMatchInlineSnapshot(`
      "${EMOJI_CAKE} **Dropped cakes** 

      \`\`\`

        Channel   Amount 
      ───────────────────
        #${channelOne.name}  7      
      ───────────────────
        #${channelTwo.name}    1      
      \`\`\`"
    `);

    done();
  });
});
