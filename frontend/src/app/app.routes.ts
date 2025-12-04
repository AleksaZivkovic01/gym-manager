import { Routes } from '@angular/router';
import { MemberListComponent } from './features/members/components/member-list/member-list.component';
import { MemberFormComponent } from './features/members/components/member-form/member-form.component';
import { TrainerListComponent } from './features/trainers/components/trainer-list/trainer-list.component';
import { TrainerFormComponent } from './features/trainers/components/trainer-form/trainer-form.component';
import { SessionListComponent } from './features/sessions/components/session-list/session-list.component';
import { SessionFormComponent } from './features/sessions/components/session-form/session-form.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'members', component: MemberListComponent, canActivate: [authGuard] },
  { path: 'members/add', component: MemberFormComponent, canActivate: [authGuard] },
  { path: 'members/edit/:id', component: MemberFormComponent, canActivate: [authGuard] },

  { path: 'trainers', component: TrainerListComponent, canActivate: [authGuard] },
  { path: 'trainers/add', component: TrainerFormComponent, canActivate: [authGuard] },
  { path: 'trainers/edit/:id', component: TrainerFormComponent, canActivate: [authGuard] },

  { path: 'sessions', component: SessionListComponent, canActivate: [authGuard] },
  { path: 'sessions/add', component: SessionFormComponent, canActivate: [authGuard] },
  { path: 'sessions/edit/:id', component: SessionFormComponent, canActivate: [authGuard] },

  { path: '', redirectTo: 'members', pathMatch: 'full' },
  { path: '**', redirectTo: 'members' },
];
