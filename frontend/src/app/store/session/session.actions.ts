import { createAction, props } from '@ngrx/store';
import { TrainingSession } from '../../shared/models/training-session.model';

export const loadSessions = createAction('[Session] Load Sessions');
export const loadSessionsSuccess = createAction('[Session] Load Sessions Success',props<{ sessions: TrainingSession[] }>());
export const loadSessionsFailure = createAction('[Session] Load Sessions Failure',props<{ error: string }>());

export const addSession = createAction('[Session] Add Session',props<{ session: TrainingSession }>());
export const addSessionSuccess = createAction('[Session] Add Session Success',props<{ session: TrainingSession }>());
export const addSessionFailure = createAction('[Session] Add Session Failure',props<{ error: string }>());

export const updateSession = createAction('[Session] Update Session',props<{ session: TrainingSession }>());
export const updateSessionSuccess = createAction('[Session] Update Session Success',props<{ session: TrainingSession }>());
export const updateSessionFailure = createAction('[Session] Update Session Failure',props<{ error: string }>());

export const deleteSession = createAction('[Session] Delete Session',props<{ id: number }>());
export const deleteSessionSuccess = createAction('[Session] Delete Session Success',props<{ id: number }>());
export const deleteSessionFailure = createAction('[Session] Delete Session Failure',props<{ error: string }>());
