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

  @OneToMany(() => Member, member => member.server, { eager: true })
  members!: Member[];

  @OneToMany(() => Prize, prize => prize.server, { eager: true })
  prizes!: Prize[];

  @OneToMany(() => Drop, drop => drop.server, { eager: true })
  drops!: Drop[];

  static async findOrCreate(guildId: string): Promise<Server> {
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
  }

  totalEarnedByMembers(): number {
    let totalEarned = 0;

    if (this.members) {
      this.members.forEach(m => {
        totalEarned += m.earned;
      });
    }

    return totalEarned;
  }
}
