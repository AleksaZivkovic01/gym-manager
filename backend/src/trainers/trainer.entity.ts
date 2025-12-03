import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TrainingSession } from '../sessions/training-session.entity';
import { User } from '../user/user.entity';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  experienceYears?: number;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @OneToMany(() => TrainingSession, (session) => session.trainer)
  sessions: TrainingSession[];

  @OneToOne(() => User, (user) => user.trainer)
  @JoinColumn() 
  user: User;
}
