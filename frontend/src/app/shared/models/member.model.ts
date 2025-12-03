export interface Member {
  id: number;
  name: string;
  level: 'beginner' | 'medium' | 'expert';
  isActive: boolean;
  gender?: string;
  dateOfBirth?: string;
}
