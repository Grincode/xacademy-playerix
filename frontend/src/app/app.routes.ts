import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { PlayerListComponent } from './features/players/player-list/player-list.component';
import { PlayerDetailComponent } from './features/players/player-detail/player-detail.component';
import { PlayerEditComponent } from './features/players/player-edit/player-edit.component';
import { UserListComponent } from './features/admin/user-list/user-list.component';
import { UserFormComponent } from './features/admin/user-form/user-form.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'players',
    canActivate: [authGuard],
    children: [
      { path: '', component: PlayerListComponent },
      { path: 'new', component: PlayerEditComponent },
      { path: ':id', component: PlayerDetailComponent },
      { path: ':id/edit', component: PlayerEditComponent },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'users', component: UserListComponent },
      { path: 'users/new', component: UserFormComponent },
      { path: 'users/:id/edit', component: UserFormComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
