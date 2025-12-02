import { TrainingSession } from '../../shared/models/training-session.model';

export interface SessionState {
  sessions: TrainingSession[];
  loading: boolean;
  error: string | null;
}

export const initialSessionState: SessionState = {
  sessions: [],
  loading: false,
  error: null,
};
