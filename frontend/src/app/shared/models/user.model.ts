export type UserRole = 'member' | 'trainer';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

