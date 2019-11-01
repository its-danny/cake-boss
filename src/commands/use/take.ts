import { Argv } from 'yargs';
import { TextChannel } from 'discord.js';
import { isEmpty, sample } from 'lodash';
import Server from '../../entity/server';
import Drop from '../../entity/drop';
import { logEvent, logMilestone } from '../../utils/logger';
import Member from '../../entity/member';
import { isShamed } from '../../utils/permissions';
import { EMOJI_DONT_DO_THAT, EMOJI_RECORD_NOT_FOUND, EMOJI_JOB_WELL_DONE } from '../../utils/emoji';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';
import { handleError } from '../../utils/errors';

export const takeCake = async (args: CommandArguments): Promise<CommandResponse | void> => {
  try {
    const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

    if (!server) {
      throw new Error('Could not find server.');
    }

    if (await isShamed(server.discordId, args.message.member.id)) {
      return {
        content: `${EMOJI_DONT_DO_THAT} You have been **shamed** and can not get ${server.config.cakeNamePlural}!`,
      };
    }

    const drop = await Drop.findOne({ where: { server, channelDiscordId: args.message.channel.id } });

    if (!drop) {
      return {
        content: `${EMOJI_RECORD_NOT_FOUND} There are no drops here!\n${
          !isEmpty(server.config.noDropGifs) ? sample(server.config.noDropGifs) : ''
        }`,
      };
    }

    drop.amount -= 1;

    if (drop.amount <= 0) {
      await drop.remove();
    } else {
      await drop.save();
    }

    const member = await Member.findOne({ where: { discordId: args.message.member.id } });

    if (!member) {
      throw new Error('Could not find member.');
    }

    const previousEarned = member.earned;
    member.earned += 1;
    member.balance += 1;

    await member.save();

    const discordChannel = args.message.guild.channels.get(args.message.channel.id) as TextChannel;

    logEvent(
      args.client,
      args.message,
      `${server.config.cakeEmoji} \`${args.message.author.tag}\` took a ${server.config.cakeNameSingular} from \`#${discordChannel.name}\`!`,
    );

    server.milestones.forEach(milestone => {
      if (previousEarned < milestone.amount && member.earned >= milestone.amount) {
        const roles = milestone.roleIds.map(roleId => args.message.guild.roles.find(role => role.id === roleId));
        args.message.member.addRoles(roles);

        logMilestone(args.client, args.message, milestone, args.message.member, roles);
      }
    });

    if (previousEarned < server.config.requirementToGive && member.earned >= server.config.requirementToGive) {
      args.message.channel.send(
        `${server.config.cakeEmoji} You can now give ${server.config.cakeNamePlural}, <@${args.message.member.id}>!`,
      );
    }

    if (server.config.quietMode) {
      let react: string;

      if (/\b:\d{18}/.test(server.config.cakeEmoji)) {
        [react] = server.config.cakeEmoji.match(/\d{18}/)!;
      } else {
        react = server.config.cakeEmoji;
      }

      args.message.react(react);

      return undefined;
    }
    return { content: `${EMOJI_JOB_WELL_DONE} ${server.config.cakeEmoji} You got it, <@${args.message.member.id}>!` };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = 'take';
export const describe = 'Take a dropped cake';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.needsFetch = true;
  args.careAboutQuietMode = true;
  args.promisedOutput = takeCake(args);
};
