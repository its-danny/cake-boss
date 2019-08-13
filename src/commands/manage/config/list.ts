import { Argv } from 'yargs';

export const command = 'list <command>';
export const describe = 'View config settings';

export const builder = (yargs: Argv) => {
  const NODE_ENV: string = process.env.NODE_ENV as string;
  return yargs.commandDir('list', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'production' ? 'js' : 'ts'] });
};
