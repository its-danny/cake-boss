import { Argv } from "yargs";

export const command = "prize <command>";
export const describe = "Manage prizes";

export const builder = (yargs: Argv) => {
  const NODE_ENV: string = process.env.NODE_ENV as string;
  return yargs.commandDir("prize", {
    exclude: /\.test\./gm,
    extensions: [NODE_ENV === "production" ? "js" : "ts"]
  });
};
