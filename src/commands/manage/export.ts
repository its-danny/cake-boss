import { Argv } from 'yargs';
import moment from 'moment';
import { parse } from 'json2csv';
import fs from 'fs';
import Server from '../../entity/server';
import { canManage } from '../../utils/permissions';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_WORKING_HARD, EMOJI_ERROR } from '../../utils/emoji';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';
import Member from '../../entity/member';

export const exportData = async (args: CommandArguments): Promise<CommandResponse> => {
  try {
    if (!(await canManage(args.message))) {
      return { content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!` };
    }

    const server = await Server.findOne({ where: { discordId: args.message.guild.id }, cache: true });

    if (!server) {
      throw new Error('Could not find server.');
    }

    if (!args.message.guild.me.hasPermission('ATTACH_FILES')) {
      return { content: `${EMOJI_ERROR} I need permission to \`attach files\`!` };
    }

    if (server.members.length === 0) {
      return { content: `${EMOJI_WORKING_HARD} Nobody has ${server.config.cakeNamePlural} yet!` };
    }

    const fields = ['Server ID', 'User ID', 'Member ID', 'Balance', 'Earned', 'Given', 'Shamed'];
    const data: any = [];

    const members = await Member.find({ where: { server }, relations: ['user'], cache: true });

    // eslint-disable-next-line no-restricted-syntax
    for (const member of members) {
      data.push({
        'Server ID': server.discordId,
        'User ID': member.user.discordId,
        'Member ID': member.discordId,
        Balance: member.balance,
        Earned: member.earned,
        Given: member.given,
        Shamed: member.shamed,
      });
    }

    const csv = parse(data, { fields });
    const filePath = `${process.cwd()}/tmp/`;
    const fileName = `export-${server.discordId}-${moment().unix()}.csv`;

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }

    fs.writeFileSync(filePath + fileName, csv);

    return { content: `${EMOJI_WORKING_HARD} Of course!`, messageOptions: { files: [filePath + fileName] } };
  } catch (error) {
    throw new Error(error);
  }
};

export const command = 'export';
export const describe = 'Export cake data';

export const builder = (yargs: Argv) => yargs;

export const handler = async (args: CommandArguments) => {
  args.promisedOutput = exportData(args);
};
