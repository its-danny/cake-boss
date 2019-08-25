import { Argv } from 'yargs';
import { CommandArguments } from '../../utils/command-interfaces';

export const command = 'vote';
export const describe = `Vote for Cake Boss!`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.promisedOutput = new Promise(resolve =>
    resolve({
      content: `
        Vote for Cake Boss if you're diggin' it!

        Discord Bots: <https://discordbots.org/bot/611013950942871562>
        Bots on Discrd: <https://bots.ondiscord.xyz/bots/611013950942871562>
      `
        .split('\n')
        .map(l => l.trim())
        .join('\n')
        .trim(),
    }),
  );
};
