import { Argv } from 'yargs';
import moment from 'moment';
import fs from 'fs';

interface Arguments {
  [x: string]: unknown;
  promisedOutput: Promise<string> | null;
}

export const command = 'uptime';
export const describe = 'View uptime';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  const start = parseInt(fs.readFileSync('./.uptime', 'utf8'), 10);
  args.promisedOutput = new Promise(resolve => resolve(`😅 I started workin' ${moment(start).from()}.`));
};
