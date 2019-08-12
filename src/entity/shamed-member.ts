import { Entity, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import Member from './member';
import Server from './server';

@Entity()
export default class ShamedMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @ManyToOne(() => Member, member => member.shamed)
  member!: Member;

  @ManyToOne(() => Server, server => server.shamed)
  server!: Server;
}
