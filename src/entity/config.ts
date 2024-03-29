import { Guild } from "discord.js";
import { chain, isEmpty } from "lodash";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { toSentenceSerial } from "underscore.string";

import { EMOJI_CAKE } from "../utils/emoji";

export type ConfigCommand =
  | "command-prefix"
  | "quiet-mode"
  | "log-channel"
  | "log-with-link"
  | "redeem-channel"
  | "redeem-timer"
  | "milestone-channel"
  | "manager-roles"
  | "blesser-roles"
  | "dropper-roles"
  | "redeem-ping-roles"
  | "nickname"
  | "cake-emoji"
  | "cake-name-singular"
  | "cake-name-plural"
  | "drop-gifs"
  | "no-drop-gifs"
  | "no-giving"
  | "requirement-to-give"
  | "give-limit"
  | "give-limit-hour-reset";

type RoleType = "manager-roles" | "blesser-roles" | "dropper-roles" | "redeem-ping-roles";
type CakeNameType = "singular" | "plural";

@Entity()
export default class Config extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false, default: "cake" })
  commandPrefix!: string;

  @Column({ nullable: false, default: false })
  quietMode!: boolean;

  @Column({ nullable: true, type: String })
  logChannelId!: string | null;

  @Column({ nullable: false, default: false })
  logWithLink!: boolean;

  @Column({ nullable: true, type: String })
  redeemChannelId!: string | null;

  @Column({ nullable: false, default: 10 })
  redeemTimer!: number;

  @Column({ nullable: true, type: String })
  milestoneChannelId!: string | null;

  @Column("simple-array", { nullable: false, default: "" })
  managerRoleIds!: string[];

  @Column("simple-array", { nullable: false, default: "" })
  blesserRoleIds!: string[];

  @Column("simple-array", { nullable: false, default: "" })
  dropperRoleIds!: string[];

  @Column("simple-array", { nullable: false, default: "" })
  redeemPingRoleIds!: string[];

  @Column({ nullable: false, default: "CAKE BOSS!" })
  nickname!: string;

  @Column({ nullable: false, default: EMOJI_CAKE })
  cakeEmoji!: string;

  @Column({ nullable: false, default: "cake" })
  cakeNameSingular!: string;

  @Column({ nullable: false, default: "cakes" })
  cakeNamePlural!: string;

  @Column("simple-array", { nullable: false, default: "" })
  dropGifs!: string[];

  @Column("simple-array", { nullable: false, default: "" })
  noDropGifs!: string[];

  @Column({ nullable: false, default: false })
  noGiving!: boolean;

  @Column({ nullable: false, default: 0 })
  requirementToGive!: number;

  @Column({ nullable: false, default: 5 })
  giveLimit!: number;

  @Column({ nullable: false, default: 1 })
  giveLimitHourReset!: number;

  setCommandPrefix(prefix: string): boolean {
    if (prefix === "") {
      return false;
    }

    this.commandPrefix = prefix;

    return true;
  }

  setQuietMode(toggle: string): boolean {
    if (toggle !== "true" && toggle !== "false") {
      return false;
    }

    this.quietMode = toggle === "true";

    return true;
  }

  setLogChannel(channelString: string, guild: Guild): boolean {
    if (channelString === "none") {
      this.logChannelId = null;

      return true;
    }

    const channelId = channelString.replace(/^<#/, "").replace(/>$/, "");
    const channel = guild.channels.cache.get(channelId);

    if (!channel) {
      return false;
    }

    this.logChannelId = channelId;

    return true;
  }

  setLogWithLink(toggle: string): boolean {
    if (toggle !== "true" && toggle !== "false") {
      return false;
    }

    this.logWithLink = toggle === "true";

    return true;
  }

  setRedeemChannel(channelString: string, guild: Guild): boolean {
    if (channelString === "none") {
      this.redeemChannelId = null;

      return true;
    }

    const channelId = channelString.replace(/^<#/, "").replace(/>$/, "");
    const channel = guild.channels.cache.get(channelId);

    if (!channel) {
      return false;
    }

    this.redeemChannelId = channelId;

    return true;
  }

  setRedeemTimer(seconds: string) {
    const number = parseInt(seconds, 10);

    if (!Number.isInteger(number) || number < 0) {
      return false;
    }

    this.redeemTimer = number;

    return true;
  }

  setMilestoneChannel(channelString: string, guild: Guild): boolean {
    if (channelString === "none") {
      this.milestoneChannelId = null;

      return true;
    }

    const channelId = channelString.replace(/^<#/, "").replace(/>$/, "");
    const channel = guild.channels.cache.get(channelId);

    if (!channel) {
      return false;
    }

    this.milestoneChannelId = channelId;

    return true;
  }

  setRoles(roles: string, type: RoleType, guild: Guild): boolean {
    if (roles === "none") {
      switch (type) {
        case "manager-roles":
          this.managerRoleIds = [];
          break;
        case "blesser-roles":
          this.blesserRoleIds = [];
          break;
        case "dropper-roles":
          this.dropperRoleIds = [];
          break;
        case "redeem-ping-roles":
          this.redeemPingRoleIds = [];
          break;
        default:
      }

      return true;
    }

    const foundRolesIds = roles
      .split(",")
      .map((g) => g.trim())
      .filter((roleName) => {
        return guild.roles.cache.find((role) => role.name === roleName);
      })
      .map((roleName) => {
        return guild.roles.cache.find((role) => role.name === roleName)!.id;
      });

    if (foundRolesIds.length > 0) {
      switch (type) {
        case "manager-roles":
          this.managerRoleIds = foundRolesIds;
          break;
        case "blesser-roles":
          this.blesserRoleIds = foundRolesIds;
          break;
        case "dropper-roles":
          this.dropperRoleIds = foundRolesIds;
          break;
        case "redeem-ping-roles":
          this.redeemPingRoleIds = foundRolesIds;
          break;
        default:
      }
    } else {
      return false;
    }

    return true;
  }

  setNickname(nickname: string): boolean {
    if (nickname === "") {
      return false;
    }

    this.nickname = nickname;

    return true;
  }

  setCakeEmoji(emoji: string): boolean {
    if (emoji === "") {
      return false;
    }

    this.cakeEmoji = emoji;

    return true;
  }

  setCakeName(name: string, type: CakeNameType): boolean {
    if (name === "") {
      return false;
    }

    if (type === "singular") {
      this.cakeNameSingular = name;
    } else if (type === "plural") {
      this.cakeNamePlural = name;
    } else {
      return false;
    }

    return true;
  }

  setDropGifs(gifs: string): boolean {
    if (gifs === "none") {
      this.dropGifs = [];
    } else {
      this.dropGifs = gifs.split(",").map((g) => g.trim());
    }

    return true;
  }

  setNoDropGifs(gifs: string): boolean {
    if (gifs === "none") {
      this.noDropGifs = [];
    } else {
      this.noDropGifs = gifs.split(",").map((g) => g.trim());
    }

    return true;
  }

  setNoGiving(toggle: string): boolean {
    if (toggle !== "true" && toggle !== "false") {
      return false;
    }

    this.noGiving = toggle === "true";

    return true;
  }

  setRequirementToGive(minimum: string): boolean {
    const number = parseInt(minimum, 10);

    if (!Number.isInteger(number) || number < 0) {
      return false;
    }

    this.requirementToGive = number;

    return true;
  }

  setGiveLimit(limit: string): boolean {
    const number = parseInt(limit, 10);

    if (!Number.isInteger(number) || number < 1) {
      return false;
    }

    this.giveLimit = number;

    return true;
  }

  setGiveLimitHourReset(limit: string): boolean {
    const number = parseInt(limit, 10);

    if (!Number.isInteger(number) || number < 1) {
      return false;
    }

    this.giveLimitHourReset = number;

    return true;
  }

  getValue(config: ConfigCommand, guild: Guild): { [key: string]: string } | void {
    const logChannel = this.logChannelId ? guild.channels.cache.get(this.logChannelId) : null;
    const redeemChannel = this.redeemChannelId ? guild.channels.cache.get(this.redeemChannelId) : null;
    const milestoneChannel = this.milestoneChannelId ? guild.channels.cache.get(this.milestoneChannelId) : null;

    const getRoles = (ids: string[]): string[] => {
      return chain(ids)
        .map((roleId) => {
          const role = guild.roles.cache.get(roleId);

          if (role) {
            return role.name;
          }

          return undefined;
        })
        .compact()
        .value();
    };

    const managerRoles = getRoles(this.managerRoleIds);
    const blesserRoles = getRoles(this.blesserRoleIds);
    const dropperRoles = getRoles(this.dropperRoleIds);
    const redeemPingRoles = getRoles(this.redeemPingRoleIds);

    switch (config) {
      case "command-prefix":
        return { default: "-", value: this.commandPrefix };
      case "quiet-mode":
        return { default: "false", value: `${this.quietMode}` };
      case "log-channel":
        return {
          default: "none",
          value: logChannel ? `#${logChannel.name}` : "none",
        };
      case "log-with-link":
        return { default: "false", value: `${this.logWithLink}` };
      case "redeem-channel":
        return {
          default: "none",
          value: redeemChannel ? `#${redeemChannel.name}` : "none",
        };
      case "redeem-timer":
        return { default: "10", value: `${this.redeemTimer}` };
      case "milestone-channel":
        return {
          default: "none",
          value: milestoneChannel ? `#${milestoneChannel.name}` : "none",
        };
      case "manager-roles":
        return {
          default: "none",
          value: isEmpty(managerRoles) ? "none" : toSentenceSerial(managerRoles),
        };
      case "blesser-roles":
        return {
          default: "none",
          value: isEmpty(blesserRoles) ? "none" : toSentenceSerial(blesserRoles),
        };
      case "dropper-roles":
        return {
          default: "none",
          value: isEmpty(dropperRoles) ? "none" : toSentenceSerial(dropperRoles),
        };
      case "redeem-ping-roles":
        return {
          default: "none",
          value: isEmpty(redeemPingRoles) ? "none" : toSentenceSerial(redeemPingRoles),
        };
      case "nickname":
        return { default: "CAKE BOSS!", value: this.nickname || "" };
      case "cake-emoji":
        return { default: EMOJI_CAKE, value: this.cakeEmoji };
      case "cake-name-singular":
        return { default: "cake", value: this.cakeNameSingular };
      case "cake-name-plural":
        return { default: "cakes", value: this.cakeNamePlural };
      case "drop-gifs":
        return {
          default: "none",
          value: isEmpty(this.dropGifs) ? "none" : toSentenceSerial(this.dropGifs),
        };
      case "no-drop-gifs":
        return {
          default: "none",
          value: isEmpty(this.noDropGifs) ? "none" : toSentenceSerial(this.noDropGifs),
        };
      case "no-giving":
        return { default: "false", value: `${this.noGiving}` };
      case "requirement-to-give":
        return { default: "0", value: `${this.requirementToGive}` };
      case "give-limit":
        return { default: "5", value: `${this.giveLimit}` };
      case "give-limit-hour-reset":
        return { default: "1", value: `${this.giveLimitHourReset}` };
      default:
        return undefined;
    }
  }
}
