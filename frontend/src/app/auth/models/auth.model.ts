import { User, UserRole } from '../../shared/models/user.model';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MemberRegisterData {
  name: string;
  level: 'beginner' | 'medium' | 'expert';
  gender?: string;
  dateOfBirth?: string;
}

export interface TrainerRegisterData {
  name: string;
  specialty: string;
  experienceYears?: number;
  gender?: string;
  dateOfBirth?: string;
}

export interface RegisterRequest extends LoginRequest {
  role: UserRole;
  member?: MemberRegisterData;
  trainer?: TrainerRegisterData;
}

