import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import Server from './server';

@Entity()
export default class Drop extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false })
  channelDiscordId!: string;

  @Column({ nullable: false, default: 0 })
  amount!: number;

  @ManyToOne(
    () => Server,
    server => server.drops,
  )
  server!: Server;
}
