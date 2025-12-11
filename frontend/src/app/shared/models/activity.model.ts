export type ActivityType = 'user_registered' | 'session_created';

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  data: {
    userName?: string;
    userRole?: 'member' | 'trainer';
    sessionType?: string;
    sessionDate?: string;
    sessionTime?: string;
    trainerName?: string;
  };
}
