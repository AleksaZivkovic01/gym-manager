import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { MemberEffects } from './store/member/member.effects';
import { memberReducer } from './store/member/member.reducer';
import { trainerReducer } from './store/trainer/trainer.reducer';
import { TrainerEffects } from './store/trainer/trainer.effects';
import { sessionReducer } from './store/session/session.reducer';
import { SessionEffects } from './store/session/session.effects';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { authInterceptor } from './auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      members: memberReducer,
      trainers: trainerReducer,
      sessions: sessionReducer,
      auth: authReducer
    }), 
    provideEffects([
      MemberEffects,
      TrainerEffects,
      SessionEffects,
      AuthEffects
    ]), 
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
    
};
