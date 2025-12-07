import { createAction, props } from '@ngrx/store';
import { User } from '../../shared/models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../auth/models/auth.model';

// Login actions
export const login = createAction('[Auth] Login', props<{ credentials: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ response: AuthResponse }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

// Register actions
export const register = createAction('[Auth] Register', props<{ data: RegisterRequest }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ response: AuthResponse }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

// Logout action
export const logout = createAction('[Auth] Logout');

// Load user from storage
export const loadUserFromStorage = createAction('[Auth] Load User From Storage');
export const loadUserFromStorageSuccess = createAction(
  '[Auth] Load User From Storage Success',
  props<{ user: User; token: string }>()
);

// Clear error
export const clearAuthError = createAction('[Auth] Clear Error');

// Refresh current user
export const refreshCurrentUser = createAction('[Auth] Refresh Current User');
export const refreshCurrentUserSuccess = createAction(
  '[Auth] Refresh Current User Success',
  props<{ user: User }>()
);
export const refreshCurrentUserFailure = createAction(
  '[Auth] Refresh Current User Failure',
  props<{ error: string }>()
);

