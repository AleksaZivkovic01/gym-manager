import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Member } from '../members/member.entity';
import { Trainer } from '../trainers/trainer.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn()
  member: Member;

  @ManyToOne(() => Trainer, { onDelete: 'CASCADE' })
  @JoinColumn()
  trainer: Trainer;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}

