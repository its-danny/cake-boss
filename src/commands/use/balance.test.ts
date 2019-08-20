import { createConnection, getConnection } from 'typeorm';
import { getBalance } from './balance';
import { createServer, createMember, createMessage, createClient } from '../../../test/test-helpers';
import { EMOJI_CAKE } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';
import Config from '../../entity/config';
import Drop from '../../entity/drop';
import Member from '../../entity/member';
import Server from '../../entity/server';
import Prize from '../../entity/prize';
import User from '../../entity/user';

describe('commands/use/balance', () => {
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

  it(`should give you your balance`, async done => {
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

    const response = await getBalance(args);
    expect(response).toBe(`${EMOJI_CAKE} Your current balance is 3 cakes!`);

    done();
  });
});
