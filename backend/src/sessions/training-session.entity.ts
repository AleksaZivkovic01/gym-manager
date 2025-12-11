import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Trainer } from '../trainers/trainer.entity';
import { SessionRegistration } from './session-registration.entity';

@Entity()
export class TrainingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' }) 
  date: Date;

  @Column({ type: 'time' })
  time: string;

  @Column()
  type: string;

  @Column({ type: 'int', default: 10 })
  maxParticipants: number;

  @ManyToOne(() => Trainer, (trainer) => trainer.sessions)
  trainer: Trainer;

  @OneToMany(() => SessionRegistration, (registration) => registration.session)
  registrations: SessionRegistration[];

  @CreateDateColumn()
  createdAt: Date;
}
