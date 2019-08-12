import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EMOJI_CAKE } from '../utils/emoji';

@Entity()
export default class Config extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false, default: '-' })
  commandPrefix!: string;

  @Column({ nullable: false, default: '' })
  logChannelId!: string;

  @Column({ nullable: false, default: '' })
  redeemChannelId!: string;

  @Column({ nullable: false, default: EMOJI_CAKE })
  cakeEmoji!: string;

  @Column({ nullable: false, default: 'cake' })
  cakeNameSingular!: string;

  @Column({ nullable: false, default: 'cakes' })
  cakeNamePlural!: string;

  @Column('simple-array', { nullable: false, default: '' })
  managerRoles!: string[];

  @Column('simple-array', { nullable: false, default: '' })
  blesserRoles!: string[];

  @Column('simple-array', { nullable: false, default: '' })
  dropperRoles!: string[];

  @Column({ nullable: false, default: 0 })
  requirementToGive!: number;

  @Column({ nullable: false, default: 5 })
  giveLimit!: number;

  @Column({ nullable: false, default: 1 })
  giveLimitHourReset!: number;
}
