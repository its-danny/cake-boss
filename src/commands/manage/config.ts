import { Argv } from 'yargs';

export const command = 'config <command>';
export const describe = 'Manage server config';

export const builder = (yargs: Argv) => {
  const NODE_ENV: string = process.env.NODE_ENV as string;
  return yargs.commandDir('config', { exclude: /\.test\./gm, extensions: [NODE_ENV === 'development' ? 'ts' : 'js'] });
};
