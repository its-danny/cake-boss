import { Argv } from 'yargs';
import moment from 'moment';
import { isShamed } from '../../utils/permissions';
import Server from '../../entity/server';
import { logRedeemed } from '../../utils/logger';
import Member from '../../entity/member';
import { EMOJI_DONT_DO_THAT, EMOJI_PRIZE, EMOJI_ERROR, EMOJI_RECORD_NOT_FOUND } from '../../utils/emoji';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';

export const redeemCake = async (args: CommandArguments): Promise<CommandResponse> => {
  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (!args.message.guild.me.hasPermission('MANAGE_ROLES')) {
    return { content: `${EMOJI_ERROR} I need permission to \`manage roles\`!` };
  }

  if (!args.message.guild.me.hasPermission('MANAGE_MESSAGES')) {
    return { content: `${EMOJI_ERROR} I need permission to \`manage messages\`!` };
  }

  if (!args.message.guild.me.hasPermission('ADD_REACTIONS')) {
    return { content: `${EMOJI_ERROR} I need permission to \`add reactions\`!` };
  }

  if (!server.config.redeemChannelId || server.config.redeemChannelId === '') {
    return { content: `${EMOJI_ERROR} Server not yet set up for prizes!` };
  }

  if (await isShamed(args.message.guild.id, args.message.member.id)) {
    return {
      content: `${EMOJI_DONT_DO_THAT} You have been **shamed** and can not redeem ${server.config.cakeNamePlural}!`,
    };
  }

  const prizeList: string[] = [];
  args.reactions = {};

  const member = await Member.findOne({ where: { discordId: args.message.member.id } });

  if (server.prizes.length === 0) {
    return { content: `${EMOJI_RECORD_NOT_FOUND} There are no prizes.` };
  }

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

        if (prize.roleIds.length > 0) {
          const roles = prize.roleIds.map(id => args.message.guild.roles.find(r => r.id === id));

          if (roles.length > 0) {
            args.message.member.addRoles(roles);
          }
        }

        logRedeemed(
          args.client,
          args.message,
          `${EMOJI_PRIZE} \`${moment().format('MMMM Do YYYY')}\` \`@${args.message.author.tag}\` redeemed a prize: \`${
            prize.description
          }\`!`,
        );
      };
    }

    return false;
  });

  return {
    content: [
      `${EMOJI_PRIZE} **React to redeem!** Message will be deleted after 10 seconds.`,
      `\`--------------------------------------------------------\`\n`,
      `${prizeList.join('\n')}`,
    ].join('\n'),
  };
};

export const command = 'redeem';
export const describe = 'Redeem your cakes for prizes!';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.deleteCaller = true;
  args.needsFetch = true;
  args.promisedOutput = redeemCake(args);
};
