import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Server from './server';

@Entity()
export default class Drop extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  channelDiscordId!: string;

  @Column({ nullable: false, default: 0 })
  amount!: number;

  @ManyToOne(() => Server, server => server.drops)
  server!: Server;
}
