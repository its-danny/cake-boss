import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Message } from 'discord.js';
import { toSentenceSerial } from 'underscore.string';
import { chain, isEmpty } from 'lodash';
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

    const managerRoles: string[] = chain(this.managerRoleIds)
      .map(roleId => {
        const role = message.guild.roles.get(roleId);

        if (role) {
          return role.name;
        }

        return undefined;
      })
      .compact()
      .value();

    const blesserRoles: string[] = chain(this.blesserRoleIds)
      .map(roleId => {
        const role = message.guild.roles.get(roleId);

        if (role) {
          return role.name;
        }

        return undefined;
      })
      .compact()
      .value();

    const dropperRoles: string[] = chain(this.dropperRoleIds)
      .map(roleId => {
        const role = message.guild.roles.get(roleId);

        if (role) {
          return role.name;
        }

        return undefined;
      })
      .compact()
      .value();

    switch (config) {
      case 'command-prefix':
        return { default: '-', value: this.commandPrefix };
      case 'quiet-mode':
        return { default: 'false', value: `${this.quietMode}` };
      case 'log-channel':
        return { default: 'none', value: logChannel ? `#${logChannel.name}` : 'none' };
      case 'log-with-link':
        return { default: 'false', value: `${this.logWithLink}` };
      case 'redeem-channel':
        return { default: 'none', value: redeemChannel ? `#${redeemChannel.name}` : 'none' };
      case 'manager-roles':
        return { default: 'none', value: isEmpty(managerRoles) ? 'none' : toSentenceSerial(managerRoles) };
      case 'blesser-roles':
        return { default: 'none', value: isEmpty(blesserRoles) ? 'none' : toSentenceSerial(blesserRoles) };
      case 'dropper-roles':
        return { default: 'none', value: isEmpty(dropperRoles) ? 'none' : toSentenceSerial(dropperRoles) };
      case 'nickname':
        return { default: 'CAKE BOSS!', value: this.nickname || '' };
      case 'cake-emoji':
        return { default: EMOJI_CAKE, value: this.cakeEmoji };
      case 'cake-name-singular':
        return { default: 'cake', value: this.cakeNameSingular };
      case 'cake-name-plural':
        return { default: 'cakes', value: this.cakeNamePlural };
      case 'drop-gifs':
        return { default: 'none', value: isEmpty(this.dropGifs) ? 'none' : toSentenceSerial(this.dropGifs) };
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
