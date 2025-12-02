import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as SessionActions from './session.actions';
import { SessionService } from '../../features/sessions/services/session.service';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class SessionEffects {
  private sessionService = inject(SessionService);
  private actions$ = inject(Actions);


  loadSessions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.loadSessions),
      mergeMap(() =>
        this.sessionService.getSessions().pipe(
          map(sessions => SessionActions.loadSessionsSuccess({ sessions })),
          catchError(error =>
            of(SessionActions.loadSessionsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.addSession),
      mergeMap(({ session }) =>
        this.sessionService.addSession(session).pipe(
          map(newSession => SessionActions.addSessionSuccess({ session: newSession })),
          catchError(error => of(SessionActions.addSessionFailure({ error: error.message })))
        )
      )
    )
  );

  updateSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.updateSession),
      mergeMap(({ session }) =>
        this.sessionService.updateSession(session.id, session).pipe(
          map(updated => SessionActions.updateSessionSuccess({ session: updated })),
          catchError(error =>
            of(SessionActions.updateSessionFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.deleteSession),
      mergeMap(({ id }) =>
        this.sessionService.deleteSession(id).pipe(
          map(() => SessionActions.deleteSessionSuccess({ id })),
          catchError(error =>
            of(SessionActions.deleteSessionFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
