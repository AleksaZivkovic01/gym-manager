import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TrainingSession } from '../sessions/training-session.entity';

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialty: string;

  @OneToMany(() => TrainingSession, (session) => session.trainer)
  sessions: TrainingSession[];
}
