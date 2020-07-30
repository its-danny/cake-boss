import fs from "fs";
import moment from "moment";
import { Argv } from "yargs";

import { CommandArguments } from "../../utils/command-interfaces";
import { EMOJI_WORKING_HARD } from "../../utils/emoji";

export const command = "uptime";
export const describe = "View bot uptime";

export const builder = (yargs: Argv) => yargs;

export const handler = (args: CommandArguments) => {
  const start = parseInt(fs.readFileSync(`${process.cwd()}/.uptime`, "utf8"), 10);

  args.promisedOutput = new Promise((resolve) =>
    resolve({
      content: `${EMOJI_WORKING_HARD} I started workin' ${moment(start).from(moment())}.`,
    }),
  );
};
