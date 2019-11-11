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
export default class Milestone extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false, default: 1 })
  amount!: number;

  @Column('simple-array', { nullable: false, default: '' })
  roleIds!: string[];

  @Column({ nullable: true })
  announcement!: string;

  @ManyToOne(
    () => Server,
    server => server.milestones,
  )
  server!: Server;
}
