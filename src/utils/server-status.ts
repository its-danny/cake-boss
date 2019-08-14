import Server from '../entity/server';
import Config from '../entity/config';

export const setupServer = async (guildId: string): Promise<Server> => {
  const foundServer = await Server.findOne({ where: { discordId: guildId } });

  if (foundServer) {
    foundServer.active = true;
    return foundServer.save();
  }

  const config = new Config();

  try {
    await config.save();
  } catch (error) {
    throw error;
  }

  const server = new Server();
  server.discordId = guildId;
  server.active = true;
  server.config = config;

  try {
    await server.save();
  } catch (error) {
    throw error;
  }

  return server;
};
