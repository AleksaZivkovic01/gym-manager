import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "../members/member.entity";
import { Trainer } from "../trainers/trainer.entity";

export type UserRole = 'member' | 'trainer' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; 

  @Column({
    type: 'enum',
    enum: ['member', 'trainer', 'admin'],
    default: 'member'
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: UserStatus;

  @OneToOne(() => Member, member => member.user, { nullable: true })
  member?: Member;

  @OneToOne(() => Trainer, trainer => trainer.user, { nullable: true })
  trainer?: Trainer;
}
