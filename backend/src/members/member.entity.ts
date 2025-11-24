import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TrainingSession } from '../sessions/training-session.entity';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  membershipType: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TrainingSession, (session) => session.member)
  sessions: TrainingSession[];
}
