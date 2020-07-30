import { Argv } from "yargs";

import { CommandArguments } from "../../utils/command-interfaces";

export const command = "info";
export const describe = `What is Cake Boss?`;

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  args.promisedOutput = new Promise((resolve) =>
    resolve({
      content: `
        Cake Boss is a discord bot that lets users reward each other cakes for being helpful, and redeem those cakes for prizes.

        GitHub: <https://github.com/dannytatom/cake-boss>
        Docs: <https://cake-boss.js.org/>
        Support: <https://discord.gg/2AG9fKt>
      `
        .split("\n")
        .map((l) => l.trim())
        .join("\n")
        .trim(),
    }),
  );
};
