import { Argv } from 'yargs';
import moment from 'moment';
import fs from 'fs';
import { EMOJI_WORKING_HARD } from '../../utils/emoji';
import { CommandArguments } from '../../utils/command-arguments';

export const command = 'uptime';
export const describe = 'View bot uptime';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  const start = parseInt(fs.readFileSync('./.uptime', 'utf8'), 10);
  args.promisedOutput = new Promise(resolve =>
    resolve(`${EMOJI_WORKING_HARD} I started workin' ${moment(start).from()}.`),
  );
};
