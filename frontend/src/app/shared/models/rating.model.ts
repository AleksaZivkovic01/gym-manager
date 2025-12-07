import { Member } from './member.model';
import { Trainer } from './trainer.model';

export interface Rating {
  id: number;
  rating: number; // 1-5
  comment?: string;
  member: Member;
  trainer: Trainer;
  createdAt: string;
}

