export interface Package {
  id: number;
  name: string;
  description?: string;
  price: number;
  sessionsPerMonth: number; // 0 = unlimited
  isActive: boolean;
}

