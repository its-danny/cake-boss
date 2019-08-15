import { Argv } from 'yargs';
import { CommandArguments } from '../../utils/command-arguments';

export const command = 'link';
export const describe = 'Check out the GitHub';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.promisedOutput = new Promise(resolve => resolve(`<https://github.com/dannytatom/cake-boss>`));
};
