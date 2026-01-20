import { Package } from './package.model';
import { User } from './user.model';

export interface Member {
  id: number;
  name: string;
  level: 'beginner' | 'medium' | 'expert';
  isActive: boolean;
  gender?: string;
  dateOfBirth?: string;
  package?: Package;
  packageId?: number;
  packageStatus?: 'pending_package' | 'active' | 'expired';
  membershipStartDate?: string;
  membershipEndDate?: string;
  user?: User;
}
