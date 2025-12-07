import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TrainingSession } from './training-session.entity';
import { Member } from '../members/member.entity';

@Entity()
export class SessionRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrainingSession, (session) => session.registrations, { onDelete: 'CASCADE' })
  @JoinColumn()
  session: TrainingSession;

  @ManyToOne(() => Member, (member) => member.sessionRegistrations, { onDelete: 'CASCADE' })
  @JoinColumn()
  member: Member;

  @CreateDateColumn()
  registeredAt: Date;
}

