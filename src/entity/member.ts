import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import User from './user';
import Server from './server';
import ShamedMember from './shamed-member';

@Entity()
export default class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false })
  discordId!: string;

  @Column({ nullable: false, default: 0 })
  balance!: number;

  @Column({ nullable: false, default: 0 })
  earned!: number;

  @Column({ nullable: false, default: 0 })
  given!: number;

  @Column({ nullable: false, default: 0 })
  givenSinceReset!: number;

  @ManyToOne(() => User, user => user.members)
  user!: User;

  @ManyToOne(() => Server, server => server.members)
  server!: Server;

  @OneToMany(() => ShamedMember, shamedMember => shamedMember.member)
  shamed!: ShamedMember[];

  static async findOrCreate(serverDiscordId: string, discordUserId: string, discordMemberId: string): Promise<Member> {
    const server = await Server.findOne({
      where: { discordId: serverDiscordId },
      relations: ['members'],
    });

    if (!server) {
      throw new Error('Could not find server.');
    }

    let user = await User.findOne({ where: { discordId: discordUserId } });

    if (!user) {
      user = new User();
      user.discordId = discordUserId;

      await user.save();
    }

    let member = await Member.findOne({ where: { discordId: discordMemberId } });

    if (!member) {
      member = new Member();
      member.discordId = discordMemberId;
      member.server = server;
      member.user = user;

      await member.save();
    }

    return member;
  }
}
