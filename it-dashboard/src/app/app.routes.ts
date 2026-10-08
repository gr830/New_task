import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ComputersComponent } from './features/computers/computers.component';
import { CatalogsComponent } from './features/catalogs/catalogs.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'computers', component: ComputersComponent, canActivate: [authGuard] },
  { path: 'catalogs', component: CatalogsComponent, canActivate: [authGuard] }
];