import { Argv } from 'yargs';
import { EMOJI_JOB_WELL_DONE } from '../../utils/emoji';

interface Arguments {
  [x: string]: unknown;
  promisedOutput: Promise<string> | null;
}

export const command = 'intro';
export const describe = 'How do I use this thing?';

export const builder = (yargs: Argv) => yargs;

export const handler = (args: Arguments) => {
  const output = `
    ${EMOJI_JOB_WELL_DONE} Hello!

    There's a lot of useful configs and commands, but here's a start:

    **Customizing:**
    - \`-config list help\` will show you a list of config sections
    - \`-config set <config> <value>\` will set a config
    - \`-prize help\` will give you a rundown on managing prizes

    **Using:**
    - \`-give <user> <amount>\` will give another user some cake
    - \`-balance\` will show you your cake balance
    - \`-redeem\` lets you redeem all that cake for prizes

    Beyond all that, \`-help\` will give you a full list of commands.

    If you have any questions, feel free to ask in the Discord: <https://discord.gg/2AG9fKt>
  `;

  args.promisedOutput = new Promise(resolve => resolve(output));
};
