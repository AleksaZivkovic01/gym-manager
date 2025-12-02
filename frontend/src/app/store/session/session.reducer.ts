import { createReducer, on } from '@ngrx/store';
import * as SessionActions from './session.actions';
import { initialSessionState } from './session.state';

export const sessionReducer = createReducer(
  initialSessionState,

  on(SessionActions.loadSessions, state => ({
    ...state,
    loading: true
  })),

  on(SessionActions.loadSessionsSuccess, (state, { sessions }) => ({
    ...state,
    loading: false,
    sessions
  })),

  on(SessionActions.loadSessionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(SessionActions.addSessionSuccess, (state, { session }) => ({
    ...state,
    sessions: [...state.sessions, session]
  })),

  on(SessionActions.updateSessionSuccess, (state, { session }) => ({
    ...state,
    sessions: state.sessions.map(s => s.id === session.id ? session : s)
  })),

  on(SessionActions.deleteSessionSuccess, (state, { id }) => ({
    ...state,
    sessions: state.sessions.filter(s => s.id !== id)
  }))
);
