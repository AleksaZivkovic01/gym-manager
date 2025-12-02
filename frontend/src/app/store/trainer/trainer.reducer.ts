import { createReducer, on } from '@ngrx/store';
import * as TrainerActions from './trainer.actions';
import { initialTrainerState } from './trainer.state';


export const trainerReducer = createReducer(
  initialTrainerState,

  on(TrainerActions.loadTrainers, state => ({ ...state, loading: true })),
  on(TrainerActions.loadTrainersSuccess, (state, { trainers }) => ({
    ...state,
    trainers,
    loading: false
  })),
  on(TrainerActions.loadTrainersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  on(TrainerActions.addTrainerSuccess, (state, { trainer }) => ({
    ...state,
    trainers: [...state.trainers, trainer]
  })),

  on(TrainerActions.updateTrainerSuccess, (state, { trainer }) => ({
    ...state,
    trainers: state.trainers.map(t =>
      t.id === trainer.id ? trainer : t
    )
  })),

 
  on(TrainerActions.deleteTrainerSuccess, (state, { id }) => ({
    ...state,
    trainers: state.trainers.filter(t => t.id !== id)
  }))
);
