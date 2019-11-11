import { Client, Message, MessageOptions, Attachment, RichEmbed } from "discord.js";

export interface CommandResponse {
  content: string;
  messageOptions?: MessageOptions;
  attachment?: Attachment;
  richEmbed?: RichEmbed;
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
