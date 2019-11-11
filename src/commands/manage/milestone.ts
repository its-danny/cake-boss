import { Argv } from "yargs";

export const command = "milestone <command>";
export const describe = "Manage milestones";

export const builder = (yargs: Argv) => {
  const NODE_ENV: string = process.env.NODE_ENV as string;
  return yargs.commandDir("milestone", {
    exclude: /\.test\./gm,
    extensions: [NODE_ENV === "production" ? "js" : "ts"]
  });
};
