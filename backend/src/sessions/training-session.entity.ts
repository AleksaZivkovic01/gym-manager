import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';

@Entity()
export class TrainingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  type: string;

  @ManyToOne(() => Member, (member) => member.sessions)
  member: Member;

  @ManyToOne(() => Trainer, (trainer) => trainer.sessions)
  trainer: Trainer;
}
