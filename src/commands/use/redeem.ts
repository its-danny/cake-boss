import { Argv } from 'yargs';
import { Client, Message } from 'discord.js';
import { isShamed } from '../../utils/permissions';
import Server from '../../entity/server';
import { logEvent } from '../../utils/logger';
import Member from '../../entity/member';
import { EMOJI_DONT_DO_THAT, EMOJI_PRIZE_EVENT } from '../../utils/emoji';

interface Arguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  promisedOutput: Promise<string> | null;
  reactions: { [key: string]: (userId: string) => void } | null;
}

export const redeemCake = async (args: Arguments): Promise<string> => {
  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'prizes'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (await isShamed(args.message.guild.id, args.message.member.id)) {
    return `${EMOJI_DONT_DO_THAT} You have been **shamed** and can not redeem ${server.config.cakeNamePlural}!`;
  }

  const prizeList: string[] = [];
  args.reactions = {};

  const member = await Member.findOne({ where: { discordId: args.message.member.id } });

  server.prizes.forEach(prize => {
    prizeList.push(
      `${prize.reactionEmoji} - \`${prize.description}\` - **${prize.price}** ${
        prize.price === 1 ? server.config.cakeNameSingular : server.config.cakeNamePlural
      }`,
    );

    if (member && member.balance >= prize.price) {
      args.reactions![prize.reactionEmoji] = async () => {
        member.balance -= prize.price;
        await member.save();

        logEvent(
          args.client,
          args.message,
          `${EMOJI_PRIZE_EVENT} \`@${args.message.author.tag}\` redeemed a prize! \`${prize.description}\``,
        );
      };
    }

    return false;
  });

  return [
    `${EMOJI_PRIZE_EVENT} **React to redeem!** Message will be deleted after 10 seconds.`,
    `\`--------------------------------------------------------\`\n`,
    `${prizeList.join('\n')}`,
  ].join('\n');
};

export const command = 'redeem';
export const describe = 'Redeem your cakes!';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.promisedOutput = redeemCake(args);
};
