import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import Server from './server';

@Entity()
export default class Prize extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false, default: '' })
  description!: string;

  @Column({ nullable: false, default: '' })
  reactionEmoji!: string;

  @Column({ nullable: false, default: 1 })
  price!: number;

  @Column('simple-array', { nullable: false, default: '' })
  roleIds!: string[];

  @ManyToOne(() => Server, server => server.prizes)
  server!: Server;
}
