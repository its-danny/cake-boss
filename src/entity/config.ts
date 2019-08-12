import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Config extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, default: '-' })
  commandPrefix!: string;

  @Column({ nullable: false, default: '' })
  logChannelId!: string;

  @Column({ nullable: false, default: '🍰' })
  cakeEmoji!: string;

  @Column({ nullable: false, default: 'cake' })
  cakeNameSingular!: string;

  @Column({ nullable: false, default: 'cakes' })
  cakeNamePlural!: string;

  @Column('simple-array', { nullable: false, default: '' })
  managerRoles!: string[];

  @Column('simple-array', { nullable: false, default: '' })
  blesserRoles!: string[];

  @Column({ nullable: false, default: 0 })
  requirementToGive!: number;

  @Column({ nullable: false, default: 5 })
  giveLimit!: number;

  @Column({ nullable: false, default: 1 })
  giveLimitHourReset!: number;
}
