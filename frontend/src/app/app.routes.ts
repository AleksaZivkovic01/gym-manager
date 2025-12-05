import { Routes } from '@angular/router';
import { CoreLayoutComponent } from './core/components/core-layout/core-layout.component';
import { HomeComponent } from './shared/components/home/home.component';
import { PackagesComponent } from './shared/components/packages/packages.component';
import { AboutComponent } from './shared/components/about/about.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { MemberDashboardComponent } from './shared/components/member/member-dashboard.component';
import { TrainerDashboardComponent } from './shared/components/trainer/trainer-dashboard.component';
import { AdminDashboardComponent } from './shared/components/admin/admin-dashboard.component';
import { PendingUsersComponent } from './features/users/components/pending-users/pending-users.component';
import { MemberListComponent } from './features/members/components/member-list/member-list.component';
import { MemberFormComponent } from './features/members/components/member-form/member-form.component';
import { TrainerListComponent } from './features/trainers/components/trainer-list/trainer-list.component';
import { TrainerFormComponent } from './features/trainers/components/trainer-form/trainer-form.component';
import { SessionListComponent } from './features/sessions/components/session-list/session-list.component';
import { SessionFormComponent } from './features/sessions/components/session-form/session-form.component';
import { PackageListComponent } from './features/packages/components/package-list/package-list.component';
import { PackageFormComponent } from './features/packages/components/package-form/package-form.component';
import { authGuard } from './auth/guards/auth.guard';
import { roleGuard } from './auth/guards/role.guard';

export const routes: Routes = [
  // public pages (bez layouta)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // sve ostale stranice idu unutar CoreLayout
  {
    path: '',
    component: CoreLayoutComponent,
    children: [
      // public
      { path: '', component: HomeComponent },
      { path: 'packages', component: PackagesComponent },
      { path: 'about', component: AboutComponent },

      // member zone
      {
        path: 'member/dashboard',
        component: MemberDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['member'] },
      },

      // trainer zone
      {
        path: 'trainer/dashboard',
        component: TrainerDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['trainer'] },
      },

      // admin zone
      {
        path: 'admin/dashboard',
        component: AdminDashboardComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'admin/pending-users',
        component: PendingUsersComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },

      // admin CRUD
      {
        path: 'members',
        component: MemberListComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'members/add',
        component: MemberFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'members/edit/:id',
        component: MemberFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },

      {
        path: 'trainers',
        component: TrainerListComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'trainers/add',
        component: TrainerFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'trainers/edit/:id',
        component: TrainerFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },

      {
        path: 'sessions',
        component: SessionListComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'sessions/add',
        component: SessionFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'sessions/edit/:id',
        component: SessionFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },

      {
        path: 'admin/packages',
        component: PackageListComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'admin/packages/add',
        component: PackageFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'admin/packages/edit/:id',
        component: PackageFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: '' },
];
