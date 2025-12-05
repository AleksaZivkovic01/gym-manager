import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,
  
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.accessToken,
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    token: response.accessToken,
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    error: null
  })),

  // Load from storage
  on(AuthActions.loadUserFromStorageSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: true
  })),

  // Clear error
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null
  }))
);

