import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { handleError } from "../utils/errors";
import Server from "./server";
import User from "./user";

@Entity()
export default class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false })
  discordId!: string;

  @Column({ nullable: false, default: 0 })
  balance!: number;

  @Column({ nullable: false, default: 0 })
  earned!: number;

  @Column({ nullable: false, default: 0 })
  given!: number;

  @Column({ nullable: false, default: 0 })
  givenSinceReset!: number;

  @Column({ nullable: false, default: false })
  shamed!: boolean;

  @ManyToOne(() => User, (user) => user.members)
  user!: User;

  @ManyToOne(() => Server, (server) => server.members)
  server!: Server;

  static async findOrCreate(
    serverDiscordId: string,
    discordUserId: string,
    discordMemberId: string,
  ): Promise<Member | void> {
    try {
      const foundMember = await Member.findOne({
        where: { discordId: discordMemberId },
      });

      if (foundMember) {
        return foundMember;
      }

      const server = await Server.findOne({
        where: { discordId: serverDiscordId },
      });

      if (!server) {
        throw new Error("Could not find server.");
      }

      let user = await User.findOne({ where: { discordId: discordUserId } });

      if (!user) {
        user = new User();
        user.discordId = discordUserId;

        user = await user.save();
      }

      let member = await Member.findOne({
        where: { discordId: discordMemberId },
      });

      if (!member) {
        member = new Member();
        member.discordId = discordMemberId;
        member.server = server;
        member.user = user;

        member = await member.save();
      }

      return member;
    } catch (error) {
      return handleError(error);
    }
  }
}
