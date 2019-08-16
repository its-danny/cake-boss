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

  @Column({ nullable: false, default: false })
  quietMode!: boolean;

  @Column({ nullable: true, type: String })
  logChannelId!: string | null;

  @Column({ nullable: false, default: false })
  logWithLink!: boolean;

  @Column({ nullable: true, type: String })
  redeemChannelId!: string | null;

  @Column('simple-array', { nullable: false, default: '' })
  managerRoleIds!: string[];

  @Column('simple-array', { nullable: false, default: '' })
  blesserRoleIds!: string[];

  @Column('simple-array', { nullable: false, default: '' })
  dropperRoleIds!: string[];

  @Column({ nullable: true, type: String, default: 'CAKE BOSS!' })
  nickname!: string | null;

  @Column({ nullable: false, default: EMOJI_CAKE })
  cakeEmoji!: string;

  @Column({ nullable: false, default: 'cake' })
  cakeNameSingular!: string;

  @Column({ nullable: false, default: 'cakes' })
  cakeNamePlural!: string;

  @Column({ nullable: false, default: false })
  noGiving!: boolean;

  @Column({ nullable: false, default: 0 })
  requirementToGive!: number;

  @Column({ nullable: false, default: 5 })
  giveLimit!: number;

  @Column({ nullable: false, default: 1 })
  giveLimitHourReset!: number;
}
