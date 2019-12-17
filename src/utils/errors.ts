import * as Sentry from "@sentry/node";
import { Message } from "discord.js";
import { EMOJI_ERROR } from "./emoji";

const NODE_ENV: string = process.env.NODE_ENV as string;
const SENTRY_DSN: string = process.env.SENTRY_DSN as string;
const SENTRY_DISABLED = !SENTRY_DSN || SENTRY_DSN === "";

export const handleError = async (error: Error, message: Message | null) => {
  if (message) {
    message.channel.send(`\u200B${EMOJI_ERROR} Uh oh, something broke!`);
  }

  if (NODE_ENV === "production" && !SENTRY_DISABLED) {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
};
