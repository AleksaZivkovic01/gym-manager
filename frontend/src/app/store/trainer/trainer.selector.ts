import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrainerState } from './trainer.state';

export const selectTrainerState = createFeatureSelector<TrainerState>('trainers');

export const selectAllTrainers = createSelector(
  selectTrainerState,
  state => state.trainers
);

export const selectTrainerById = (id: number) =>
  createSelector(selectTrainerState, state =>
    state.trainers.find(t => t.id === id)
  );


export const selectTrainerLoading = createSelector(
  selectTrainerState,
  state => state.loading
);

export const selectTrainerError = createSelector(
  selectTrainerState,
  state => state.error
);

