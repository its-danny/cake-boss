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
import ShamedMember from './shamed-member';

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

  @OneToOne(() => Config)
  @JoinColumn()
  config!: Config;

  @OneToMany(() => Member, member => member.server)
  members!: Member[];

  @OneToMany(() => ShamedMember, shamedMember => shamedMember.server)
  shamed!: ShamedMember[];

  @OneToMany(() => Drop, drop => drop.server)
  drops!: Drop[];
}
