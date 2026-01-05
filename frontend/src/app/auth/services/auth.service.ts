import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUser, selectIsAuthenticated, selectAuthToken } from '../../store/auth/auth.selector';
import { login, register, logout, loadUserFromStorage, refreshCurrentUser } from '../../store/auth/auth.actions';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly apiUrl = 'http://localhost:3000/auth';

  
  readonly currentUser$ = this.store.select(selectCurrentUser);
  readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);

  login(payload: LoginRequest): Observable<AuthResponse> {
    this.store.dispatch(login({ credentials: payload }));
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    this.store.dispatch(register({ data: payload }));
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
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

