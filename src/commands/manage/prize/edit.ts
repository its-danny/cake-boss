import { Argv } from 'yargs';
import { canManage } from '../../../utils/permissions';
import Server from '../../../entity/server';
import Prize from '../../../entity/prize';
import { logEvent } from '../../../utils/logger';
import { EMOJI_ERROR, EMOJI_JOB_WELL_DONE, EMOJI_INCORRECT_PERMISSIONS, EMOJI_CONFIG } from '../../../utils/emoji';
import { CommandArguments } from '../../../utils/command-arguments';

export interface Arguments extends CommandArguments {
  id: number;
  description: string;
  reactionEmoji: string;
  price: number;
  roles?: string;
}

export const editPrize = async (args: Arguments): Promise<string | void> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (!server.config.redeemChannelId || server.config.redeemChannelId === '') {
    return `${EMOJI_ERROR} You need to set the \`redeem-channel\` config before using prizes.`;
  }

  if (args.description.trim() === '') {
    return `${EMOJI_ERROR} Description required!`;
  }

  if (args.reactionEmoji.trim() === '') {
    return `${EMOJI_ERROR} Reaction emoji required!`;
  }

  if (args.price <= 0) {
    return `${EMOJI_ERROR} Price must be 1 or more!`;
  }

  const prize = await Prize.findOne({ server, id: args.id });

  if (!prize) {
    return `${EMOJI_ERROR} Couldn't find that prize, are you sure \`${args.id}\` is the right ID?`;
  }

  prize.description = args.description;
  prize.reactionEmoji = args.reactionEmoji;
  prize.price = args.price;

  if (args.roles) {
    if (args.roles === 'none') {
      prize.roleIds = [];
    } else {
      const foundRolesIds = args.roles
        .split(',')
        .map(g => g.trim())
        .filter(roleName => {
          return args.message.guild.roles.find(role => role.name === roleName.trim());
        })
        .map(roleName => args.message.guild.roles.find(role => role.name === roleName.trim()).id);

      if (foundRolesIds.length > 0) {
        prize.roleIds = foundRolesIds;
      }
    }
  }

  await prize.save();

  logEvent(
    args.client,
    args.message,
    `${EMOJI_CONFIG} \`${args.message.author.tag}\` edited prize: \`${prize.description}\``,
  );

  if (server.config.quietMode) {
    args.message.react(EMOJI_JOB_WELL_DONE);

    return undefined;
  }
  return `${EMOJI_JOB_WELL_DONE} Done!`;
};

export const command = 'edit <id> <description> <reactionEmoji> <price> [roles]';
export const describe = 'Edit a prize';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = editPrize(args);
};
