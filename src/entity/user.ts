import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import Member from './member';

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: false })
  discordId!: string;

  @OneToMany(
    () => Member,
    member => member.user,
    { eager: true },
  )
  members!: Member[];

  totalEarned(): number {
    let totalEarned = 0;

    if (this.members) {
      this.members.forEach(m => {
        totalEarned += m.earned;
      });
    }

    return totalEarned;
  }
}
