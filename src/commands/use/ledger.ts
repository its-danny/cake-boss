import { Argv } from 'yargs';
import moment from 'moment';
import { parse } from 'json2csv';
import fs from 'fs';
import Server from '../../entity/server';
import { canManage } from '../../utils/permissions';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_WORKING_HARD, EMOJI_ERROR } from '../../utils/emoji';
import { CommandArguments, CommandResponse } from '../../utils/command-interfaces';
import { handleError } from '../../utils/errors';

export const getLedger = async (args: CommandArguments): Promise<CommandResponse | void> => {
  try {
    if (!(await canManage(args.message))) {
      return { content: `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!` };
    }

    const server = await Server.findOne({ where: { discordId: args.message.guild.id } });

    if (!server) {
      throw new Error('Could not find server.');
    }

    if (!args.message.guild.me.hasPermission('ATTACH_FILES')) {
      return { content: `${EMOJI_ERROR} I need permission to \`attach files\`!` };
    }

    if (server.members.length === 0) {
      return { content: `${EMOJI_WORKING_HARD} Nobody has ${server.config.cakeNamePlural} yet!` };
    }

    const fields = ['Name/ID', 'Balance', 'Earned', 'Date Added'];
    const data: any = [];

    server.members.forEach(member => {
      const discordMember = args.message.guild.members.get(member.discordId);

      data.push({
        'Name/ID': discordMember ? discordMember.displayName : member.discordId,
        Balance: member.balance,
        Earned: member.earned,
        'Date Added': moment(member.createdAt).format('MMMM Do YYYY'),
      });
    });

    const csv = parse(data, { fields });
    const filePath = `${process.cwd()}/tmp/`;
    const fileName = `ledger-${server.discordId}-${moment().unix()}.csv`;

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }

    fs.writeFileSync(filePath + fileName, csv);

    return { content: `${EMOJI_WORKING_HARD} Of course!`, messageOptions: { files: [filePath + fileName] } };
  } catch (error) {
    return handleError(error, args.message);
  }
};

export const command = 'ledger';
export const describe = 'View the ledger';

export const builder = (yargs: Argv) => yargs;

export const handler = async (args: CommandArguments) => {
  args.promisedOutput = getLedger(args);
};
