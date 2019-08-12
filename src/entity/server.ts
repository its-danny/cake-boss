import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import Config from './config';
import Member from './member';
import Drop from './drop';

@Entity()
export default class Server extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  discordId!: string;

  @Column({ nullable: false, default: 0 })
  timeSinceLastReset!: number;

  @Column({ nullable: false, default: true })
  active!: boolean;

  @OneToOne(() => Config)
  @JoinColumn()
  config!: Config;

  @OneToMany(() => Member, member => member.server)
  members!: Member[];

  @OneToMany(() => Drop, drop => drop.server)
  drops!: Drop[];
}
