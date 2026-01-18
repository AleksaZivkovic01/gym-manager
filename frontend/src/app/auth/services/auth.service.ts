import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser, selectIsAuthenticated, selectAuthToken, selectAuthLoading, selectAuthError } from '../../store/auth/auth.selector';
import { login, register, logout, loadUserFromStorage, refreshCurrentUser } from '../../store/auth/auth.actions';
import { LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly store = inject(Store);

  readonly currentUser$ = this.store.select(selectCurrentUser);
  readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  readonly authLoading$ = this.store.select(selectAuthLoading);
  readonly authError$ = this.store.select(selectAuthError);

  login(payload: LoginRequest): void {
    this.store.dispatch(login({ credentials: payload }));
  }

  register(payload: RegisterRequest): void {
    this.store.dispatch(register({ data: payload }));
  }

  logout(): void {
    this.store.dispatch(logout());
  }

  getToken(): string | null {
    let token: string | null = null;
    this.store.select(selectAuthToken).subscribe(t => token = t).unsubscribe();
    return token;
  }

  isAuthenticated(): boolean {
    let authenticated = false;
    this.store.select(selectIsAuthenticated).subscribe(auth => authenticated = auth).unsubscribe();
    return authenticated;
  }

  refreshCurrentUser(): void {
    this.store.dispatch(refreshCurrentUser());
  }
}

