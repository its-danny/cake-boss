import { Client, Message } from 'discord.js';

export interface CommandArguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  careAboutQuietMode: boolean;
  promisedOutput: Promise<string | string[] | void> | null;
  reactions: { [key: string]: (userId: string) => void } | null;
}
