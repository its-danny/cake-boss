import { Argv } from 'yargs';
import moment from 'moment';
import { parse } from 'json2csv';
import fs from 'fs';
import Server from '../../entity/server';
import { canManage } from '../../utils/permissions';
import { EMOJI_INCORRECT_PERMISSIONS, EMOJI_WORKING_HARD } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';

export const getLedger = async (args: CommandArguments): Promise<string | void> => {
  if (!(await canManage(args.message))) {
    return `${EMOJI_INCORRECT_PERMISSIONS} You ain't got permission to do that!`;
  }

  const server = await Server.findOne({
    where: { discordId: args.message.guild.id },
    relations: ['config', 'members'],
  });

  if (!server) {
    throw new Error('Could not find server.');
  }

  if (server.members.length === 0) {
    return `${EMOJI_WORKING_HARD} Nobody has ${server.config.cakeNamePlural} yet!`;
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

  try {
    const csv = parse(data, { fields });
    const filePath = `${process.cwd()}/tmp/`;
    const fileName = `ledger-${server.discordId}-${moment().unix()}.csv`;

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }

    fs.writeFile(filePath + fileName, csv, error => {
      if (error) {
        throw error;
      }

      args.message.channel.send(`${EMOJI_WORKING_HARD} Of course!`, { files: [filePath + fileName] });

      fs.unlink(filePath + fileName, error => {
        if (error) {
          throw error;
        }
      });
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const command = 'ledger';
export const describe = 'View the ledger';

export const builder = (yargs: Argv) => yargs;

export const handler = async (args: CommandArguments) => {
  args.needsFetch = false;
  args.promisedOutput = getLedger(args);
};
