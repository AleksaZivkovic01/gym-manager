import { Column, Entity, OneToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Member } from "../members/member.entity";
import { Trainer } from "../trainers/trainer.entity";

export type UserRole = 'member' | 'trainer' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'deleted';

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
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  })
  status: UserStatus;

   @OneToOne(() => Member, member => member.user, { nullable: true, cascade: true })
  member?: Member;

  @OneToOne(() => Trainer, trainer => trainer.user, { nullable: true, cascade: true })
  trainer?: Trainer;


  @CreateDateColumn()
  createdAt: Date;
}
