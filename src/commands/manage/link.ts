import { Argv } from 'yargs';

interface Arguments {
  [x: string]: unknown;
  promisedOutput: Promise<string> | null;
}

export const command = 'link';
export const describe = 'Check out the GitHub';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  args.promisedOutput = new Promise(resolve =>
    resolve(`<https://github.com/dannytatom/cake-boss>`)
  );
};
