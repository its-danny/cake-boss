import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import Config from './config';
import Member from './member';
import Drop from './drop';
import Prize from './prize';
import Milestone from './milestone';
import { handleError } from '../utils/errors';

@Entity()
export default class Server extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false })
  discordId!: string;

  @Column({ nullable: false, default: 0 })
  timeSinceLastReset!: number;

  @Column({ nullable: false, default: true })
  active!: boolean;

  @OneToOne(() => Config, { eager: true })
  @JoinColumn()
  config!: Config;

  @OneToMany(() => Member, member => member.server)
  members!: Promise<Member[]>;

  @OneToMany(() => Prize, prize => prize.server, { eager: true })
  prizes!: Prize[];

  @OneToMany(() => Drop, drop => drop.server, { eager: true })
  drops!: Drop[];

  @OneToMany(() => Milestone, milestone => milestone.server, { eager: true })
  milestones!: Milestone[];

  static async findOrCreate(guildId: string): Promise<Server | void> {
    try {
      const foundServer = await Server.findOne({ where: { discordId: guildId } });

      if (foundServer) {
        if (foundServer.active) {
          return foundServer;
        }
        foundServer.active = true;
        return foundServer.save();
      }

      const config = new Config();

      try {
        await config.save();
      } catch (error) {
        handleError(error, null);
      }

      const server = new Server();
      server.discordId = guildId;
      server.active = true;
      server.config = config;

      return server.save();
    } catch (error) {
      return handleError(error, null);
    }
  }

  async totalEarnedByMembers(): Promise<number> {
    const members = await this.members;

    return members.map(m => m.earned).reduce((a, c) => a + c);
  }
}
