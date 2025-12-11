import { Member } from './member.model';
import { Trainer } from './trainer.model';

export type UserRole = 'guest' | 'member' | 'trainer' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  status?: UserStatus;
  member?: Member;
  trainer?: Trainer;
  createdAt?: string;
}

