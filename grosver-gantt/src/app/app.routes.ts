import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { GanttComponent } from './gantt/gantt';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'gantt', component: GanttComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/gantt', pathMatch: 'full' },
  { path: '**', redirectTo: '/gantt' }
];