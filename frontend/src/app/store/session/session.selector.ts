import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SessionState } from './session.state';

export const selectSessionState =createFeatureSelector<SessionState>('sessions');

export const selectAllSessions = createSelector(
  selectSessionState,
  state => state.sessions
);

export const selectSessionById = (id: number) =>
  createSelector(selectAllSessions, sessions =>
    sessions.find(s => s.id === id)
);
export const selectSessionLoading = createSelector(
  selectSessionState,
  state => state.loading
);

export const selectSessionError = createSelector(
  selectSessionState,
  state => state.error
);
