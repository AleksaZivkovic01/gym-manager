import { createAction, props } from '@ngrx/store';
import { Trainer } from '../../shared/models/trainer.model';

export const loadTrainers = createAction('[Trainer] Load Trainers');
export const loadTrainersSuccess = createAction('[Trainer] Load Trainers Success',props<{ trainers: Trainer[] }>());
export const loadTrainersFailure = createAction('[Trainer] Load Trainers Failure',props<{ error: string }>());

export const addTrainer = createAction('[Trainer] Add Trainer',props<{ trainer: Trainer }>());
export const addTrainerSuccess = createAction('[Trainer] Add Trainer Success',props<{ trainer: Trainer }>());
export const addTrainerFailure = createAction('[Trainer] Add Trainer Failure',props<{ error: string }>());

export const updateTrainer = createAction('[Trainer] Update Trainer',props<{ trainer: Trainer }>());
export const updateTrainerSuccess = createAction('[Trainer] Update Trainer Success',props<{ trainer: Trainer }>());
export const updateTrainerFailure = createAction('[Trainer] Update Trainer Failure',props<{ error: string }>());

export const deleteTrainer = createAction('[Trainer] Delete Trainer',props<{ id: number }>());
export const deleteTrainerSuccess = createAction('[Trainer] Delete Trainer Success',props<{ id: number }>());
export const deleteTrainerFailure = createAction('[Trainer] Delete Trainer Failure',props<{ error: string }>());
