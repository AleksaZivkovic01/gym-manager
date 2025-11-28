import { MemberListComponent } from './features/members/components/member-list/member-list.component';
import { MemberFormComponent } from './features/members/components/member-form/member-form.component';
import { Routes } from '@angular/router';
import { TrainerListComponent } from './features/trainers/components/trainer-list/trainer-list.component';
import { TrainerFormComponent } from './features/trainers/components/trainer-form/trainer-form.component';

export const routes: Routes = [
  { path: 'members', component: MemberListComponent },
  { path: 'members/add', component: MemberFormComponent },
  { path: 'members/edit/:id', component: MemberFormComponent },
  { path: '', redirectTo: 'members', pathMatch: 'full' },
  { path: 'trainers', component: TrainerListComponent },
  { path: 'trainers/add', component: TrainerFormComponent },
  { path: 'trainers/edit/:id', component: TrainerFormComponent },

];
