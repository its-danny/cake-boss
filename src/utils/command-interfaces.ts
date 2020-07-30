import { Client, Message, MessageEditOptions, MessageOptions } from "discord.js";

export interface CommandResponse {
  content: string;
  messageOptions?: MessageOptions;
  messageEditOptions?: MessageEditOptions;
}

export interface CommandArguments {
  [x: string]: unknown;
  client: Client;
  message: Message;
  needsFetch: boolean;
  careAboutQuietMode: boolean;
  promisedOutput: Promise<CommandResponse | void> | null;
  reactions: { [key: string]: (userId: string) => void } | null;
}
