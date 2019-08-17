import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Message } from 'discord.js';
import { toSentenceSerial } from 'underscore.string';
import { EMOJI_CAKE } from '../utils/emoji';

export type ConfigCommand =
  | 'command-prefix'
  | 'quiet-mode'
  | 'log-channel'
  | 'log-with-link'
  | 'redeem-channel'
  | 'manager-roles'
  | 'blesser-roles'
  | 'dropper-roles'
  | 'nickname'
  | 'cake-emoji'
  | 'cake-name-singular'
  | 'cake-name-plural'
  | 'drop-gifs'
  | 'no-giving'
  | 'requirement-to-give'
  | 'give-limit'
  | 'give-limit-hour-reset';

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

  @Column('simple-array', { nullable: false, default: '' })
  dropGifs!: string[];

  @Column({ nullable: false, default: false })
  noGiving!: boolean;

  @Column({ nullable: false, default: 0 })
  requirementToGive!: number;

  @Column({ nullable: false, default: 5 })
  giveLimit!: number;

  @Column({ nullable: false, default: 1 })
  giveLimitHourReset!: number;

  getValue(message: Message, config: ConfigCommand): { [key: string]: string } | void {
    const logChannel = this.logChannelId ? message.guild.channels.get(this.logChannelId) : null;
    const redeemChannel = this.redeemChannelId ? message.guild.channels.get(this.redeemChannelId) : null;

    switch (config) {
      case 'command-prefix':
        return { default: '-', value: this.commandPrefix };
      case 'quiet-mode':
        return { default: 'false', value: `${this.quietMode}` };
      case 'log-channel':
        return { default: '', value: logChannel ? `#${logChannel.name}` : '' };
      case 'log-with-link':
        return { default: 'false', value: `${this.logWithLink}` };
      case 'redeem-channel':
        return { default: '', value: redeemChannel ? `#${redeemChannel.name}` : '' };
      case 'manager-roles':
        return { default: '', value: toSentenceSerial(this.managerRoleIds) };
      case 'blesser-roles':
        return { default: '', value: toSentenceSerial(this.blesserRoleIds) };
      case 'dropper-roles':
        return { default: '', value: toSentenceSerial(this.dropperRoleIds) };
      case 'nickname':
        return { default: 'CAKE BOSS!', value: this.nickname || '' };
      case 'cake-emoji':
        return { default: EMOJI_CAKE, value: this.cakeEmoji };
      case 'cake-name-singular':
        return { default: 'cake', value: this.cakeNameSingular };
      case 'cake-name-plural':
        return { default: 'cakes', value: this.cakeNamePlural };
      case 'drop-gifs':
        return { deafult: '', value: toSentenceSerial(this.dropGifs) };
      case 'no-giving':
        return { default: 'false', value: `${this.noGiving}` };
      case 'requirement-to-give':
        return { default: '0', value: `${this.requirementToGive}` };
      case 'give-limit':
        return { default: '5', value: `${this.giveLimit}` };
      case 'give-limit-hour-reset':
        return { default: '1', value: `${this.giveLimitHourReset}` };
      default:
        return undefined;
    }
  }
}
