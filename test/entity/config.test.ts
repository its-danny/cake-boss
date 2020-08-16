import { Role } from "discord.js";
import faker from "faker";
import { createConnection, getConnection } from "typeorm";

import Config from "@src/entity/config";
import { createChannel, createMessage, createServer, ENTITIES } from "@test/test-helpers";

describe("entities/config", () => {
  beforeEach(async (done) => {
    await createConnection({
      type: "sqlite",
      database: ":memory:",
      dropSchema: true,
      entities: ENTITIES,
      synchronize: true,
      logging: false,
    });

    done();
  });

  afterEach(async (done) => {
    const conn = getConnection();
    await conn.close();

    done();
  });

  test("#setCommandPrefix", () => {
    const config = new Config();

    expect(config.setCommandPrefix("")).toBe(false);

    expect(config.setCommandPrefix("+")).toBe(true);
    expect(config.commandPrefix).toBe("+");
  });

  test("#setQuietMode", () => {
    const config = new Config();

    expect(config.setQuietMode("huh")).toBe(false);

    expect(config.setQuietMode("true")).toBe(true);
    expect(config.quietMode).toBe(true);

    expect(config.setQuietMode("false")).toBe(true);
    expect(config.quietMode).toBe(false);
  });

  test("#setLogChannel", async (done) => {
    const server = await createServer();
    const channel = createChannel("games");
    const message = await createMessage({ server, serverChannels: [channel] });

    expect(server.config.setLogChannel("wrong-channel", message.guild!)).toBe(false);
    expect(server.config.logChannelId).toBe(null);

    expect(server.config.setLogChannel("none", message.guild!)).toBe(true);
    expect(server.config.logChannelId).toBe(null);

    expect(server.config.setLogChannel(`<#${channel.id}>`, message.guild!)).toBe(true);
    expect(server.config.logChannelId).toBe(channel.id);

    done();
  });

  test("#setLogWithLink", () => {
    const config = new Config();

    expect(config.setLogWithLink("huh")).toBe(false);

    expect(config.setLogWithLink("true")).toBe(true);
    expect(config.logWithLink).toBe(true);

    expect(config.setLogWithLink("false")).toBe(true);
    expect(config.logWithLink).toBe(false);
  });

  test("#setRedeemTimer", () => {
    const config = new Config();

    expect(config.setRedeemTimer("words")).toBe(false);
    expect(config.setRedeemTimer("20")).toBe(true);
    expect(config.setRedeemTimer("-3")).toBe(false);
  });

  test("#setRedeemChannel", async (done) => {
    const server = await createServer();
    const channel = createChannel("games");
    const message = await createMessage({ server, serverChannels: [channel] });

    expect(server.config.setRedeemChannel("wrong-channel", message.guild!)).toBe(false);
    expect(server.config.redeemChannelId).toBe(null);

    expect(server.config.setRedeemChannel("none", message.guild!)).toBe(true);
    expect(server.config.redeemChannelId).toBe(null);

    expect(server.config.setRedeemChannel(`<#${channel.id}>`, message.guild!)).toBe(true);
    expect(server.config.redeemChannelId).toBe(channel.id);

    done();
  });

  test("#setRoles", async (done) => {
    const config = new Config();
    const server = await createServer();

    const roleOne = {
      id: faker.random.uuid(),
      name: faker.internet.domainWord(),
    } as Role;

    const roleTwo = {
      id: faker.random.uuid(),
      name: faker.internet.domainWord(),
    } as Role;

    const message = await createMessage({
      server,
      serverRoles: [roleOne, roleTwo],
    });

    expect(config.setRoles("none", "manager-roles", message.guild!)).toBe(true);
    expect(config.managerRoleIds).toEqual([]);

    expect(config.setRoles(`${roleOne.name},${roleTwo.name}`, "manager-roles", message.guild!)).toBe(true);
    expect(config.managerRoleIds).toEqual([roleOne.id, roleTwo.id]);

    done();
  });

  test("#setNickname", () => {
    const config = new Config();

    expect(config.setNickname("")).toBe(false);

    expect(config.setNickname("Gold Goblin!")).toBe(true);
    expect(config.nickname).toBe("Gold Goblin!");
  });

  test("#setCakeEmoji", () => {
    const config = new Config();

    expect(config.setCakeEmoji("")).toBe(false);

    expect(config.setCakeEmoji("💰")).toBe(true);
    expect(config.cakeEmoji).toBe("💰");
  });

  test("#setCakeName", () => {
    const config = new Config();

    expect(config.setCakeName("", "singular")).toBe(false);

    expect(config.setCakeName("gold", "singular")).toBe(true);
    expect(config.cakeNameSingular).toBe("gold");

    expect(config.setCakeName("gold", "plural")).toBe(true);
    expect(config.cakeNamePlural).toBe("gold");
  });

  test("#setDropGifs", () => {
    const config = new Config();

    expect(config.setDropGifs("none")).toBe(true);
    expect(config.dropGifs).toEqual([]);

    expect(
      config.setDropGifs(
        "https://media.giphy.com/media/QqkzeedW5Qq7S/giphy.gif,https://media.giphy.com/media/13Wlh2o9yCiMTu/giphy.gif",
      ),
    ).toBe(true);
    expect(config.dropGifs).toEqual([
      "https://media.giphy.com/media/QqkzeedW5Qq7S/giphy.gif",
      "https://media.giphy.com/media/13Wlh2o9yCiMTu/giphy.gif",
    ]);
  });

  test("#setNoDropGifs", () => {
    const config = new Config();

    expect(config.setNoDropGifs("none")).toBe(true);
    expect(config.noDropGifs).toEqual([]);

    expect(
      config.setDropGifs(
        "https://media.giphy.com/media/QqkzeedW5Qq7S/giphy.gif,https://media.giphy.com/media/13Wlh2o9yCiMTu/giphy.gif",
      ),
    ).toBe(true);
    expect(config.dropGifs).toEqual([
      "https://media.giphy.com/media/QqkzeedW5Qq7S/giphy.gif",
      "https://media.giphy.com/media/13Wlh2o9yCiMTu/giphy.gif",
    ]);
  });

  test("#setNoGiving", () => {
    const config = new Config();

    expect(config.setNoGiving("huh")).toBe(false);

    expect(config.setNoGiving("true")).toBe(true);
    expect(config.noGiving).toBe(true);

    expect(config.setNoGiving("false")).toBe(true);
    expect(config.noGiving).toBe(false);
  });

  test("#setRequirementToGive", () => {
    const config = new Config();

    expect(config.setRequirementToGive("huh")).toBe(false);

    expect(config.setRequirementToGive("-1")).toBe(false);

    expect(config.setRequirementToGive("10")).toBe(true);
    expect(config.requirementToGive).toBe(10);
  });

  test("#setGiveLimit", () => {
    const config = new Config();

    expect(config.setGiveLimit("huh")).toBe(false);

    expect(config.setGiveLimit("0")).toBe(false);

    expect(config.setGiveLimit("10")).toBe(true);
    expect(config.giveLimit).toBe(10);
  });

  test("#setGiveLimitHourReset", () => {
    const config = new Config();

    expect(config.setGiveLimitHourReset("huh")).toBe(false);

    expect(config.setGiveLimitHourReset("0")).toBe(false);

    expect(config.setGiveLimitHourReset("10")).toBe(true);
    expect(config.giveLimitHourReset).toBe(10);
  });
});
