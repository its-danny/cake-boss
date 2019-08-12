import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import User from './user';
import Server from './server';

@Entity()
export default class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

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

  @ManyToOne(() => User, user => user.members)
  user!: User;

  @ManyToOne(() => Server, server => server.members)
  server!: Server;
}
