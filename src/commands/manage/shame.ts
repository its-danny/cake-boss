import { Argv } from "yargs";

export const command = "shame <command>";
export const describe = "Manage shame list";

export const builder = (yargs: Argv) => {
  const NODE_ENV: string = process.env.NODE_ENV as string;
  return yargs.commandDir("shame", {
    exclude: /\.test\./gm,
    extensions: [NODE_ENV === "production" ? "js" : "ts"]
  });
};
