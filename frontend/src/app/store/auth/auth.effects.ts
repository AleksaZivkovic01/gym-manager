import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthResponse } from '../../auth/models/auth.model';
import { User } from '../../shared/models/user.model';

const TOKEN_KEY = 'gym_manager_token';
const USER_KEY = 'gym_manager_user';
const API_URL = 'http://localhost:3000/auth';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private router = inject(Router);

  // Login effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.http.post<AuthResponse>(`${API_URL}/login`, credentials).pipe(
          map((response) => {
            // Save to localStorage
            localStorage.setItem(TOKEN_KEY, response.accessToken);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
            return AuthActions.loginSuccess({ response });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.error?.message || error.message || 'Login failed' }))
          )
        )
      )
    )
  );

  // Register effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ data }) =>
        this.http.post<AuthResponse>(`${API_URL}/register`, data).pipe(
          map((response) => {
            // Save to localStorage
            localStorage.setItem(TOKEN_KEY, response.accessToken);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
            return AuthActions.registerSuccess({ response });
          }),
          catchError((error) =>
            of(AuthActions.registerFailure({ error: error.error?.message || error.message || 'Registration failed' }))
          )
        )
      )
    )
  );

  // Logout effect
  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  // Load user from storage on app init
  loadUserFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserFromStorage),
      map(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        const userRaw = localStorage.getItem(USER_KEY);
        
        if (token && userRaw) {
          try {
            const user = JSON.parse(userRaw);
            return AuthActions.loadUserFromStorageSuccess({ user, token });
          } catch {
            return AuthActions.logout();
          }
        }
        return AuthActions.logout();
      })
    )
  );

  // Refresh current user
  refreshCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshCurrentUser),
      switchMap(() =>
        this.http.get<User>(`${API_URL}/me`).pipe(
          map((user) => {
            // Update localStorage
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return AuthActions.refreshCurrentUserSuccess({ user });
          }),
          catchError((error) =>
            of(AuthActions.refreshCurrentUserFailure({ error: error.error?.message || error.message || 'Failed to refresh user' }))
          )
        )
      )
    )
  );
}

