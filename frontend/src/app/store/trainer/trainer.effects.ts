import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TrainerService } from '../../features/trainers/services/trainer.service';
import * as TrainerActions from './trainer.actions';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class TrainerEffects {
  private trainerService = inject(TrainerService);
  private actions$ = inject(Actions);

  // LOAD ALL
  loadTrainers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainerActions.loadTrainers),
      mergeMap(() =>
        this.trainerService.getTrainers().pipe(
          map(trainers => TrainerActions.loadTrainersSuccess({ trainers })),
          catchError(error =>
            of(TrainerActions.loadTrainersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // ADD
  addTrainer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainerActions.addTrainer),
      mergeMap(({ trainer }) =>
        this.trainerService.addTrainer(trainer).pipe(
          map(newTrainer =>
            TrainerActions.addTrainerSuccess({ trainer: newTrainer })
          ),
          catchError(error =>
            of(TrainerActions.addTrainerFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // UPDATE
  updateTrainer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainerActions.updateTrainer),
      mergeMap(({ trainer }) =>
        this.trainerService.updateTrainer(trainer.id, trainer).pipe(
          map(updated =>
            TrainerActions.updateTrainerSuccess({ trainer: updated })
          ),
          catchError(error =>
            of(TrainerActions.updateTrainerFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // DELETE
  deleteTrainer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainerActions.deleteTrainer),
      mergeMap(({ id }) =>
        this.trainerService.deleteTrainer(id).pipe(
          map(() => TrainerActions.deleteTrainerSuccess({ id })),
          catchError(error =>
            of(TrainerActions.deleteTrainerFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
