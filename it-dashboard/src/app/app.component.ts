import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.isLoggedIn()) {
      <header class="app-header">
        <div class="logo">
          <span class="icon">⚡</span>
          <div>
            <h1>IT CMDB & Topology</h1>
            <span class="sub">Корпоративный учет оборудования и связей</span>
          </div>
        </div>
        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active">🖥️ Дашборд ПК</a>
          <a routerLink="/computers" routerLinkActive="active">💻 Компьютеры и ПО</a>
          <a routerLink="/catalogs" routerLinkActive="active">📚 Справочники</a>
        </nav>
        <div class="user-block">
          <span>👨‍💻 {{ auth.currentUser() }}</span>
          <button class="logout-btn" (click)="auth.logout()">Выйти</button>
        </div>
      </header>
    }
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .app-header { background: #0f172a; color: white; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo .icon { font-size: 24px; }
    .logo h1 { font-size: 16px; margin: 0; font-weight: 700; }
    .logo .sub { font-size: 11px; color: #94a3b8; }
    .nav-links { display: flex; gap: 8px; }
    .nav-links a { color: #94a3b8; text-decoration: none; font-size: 14px; padding: 8px 14px; border-radius: 6px; }
    .nav-links a.active { color: white; background: #2563eb; font-weight: bold; }
    .user-block { display: flex; align-items: center; gap: 12px; font-size: 13px; }
    .logout-btn { background: #334155; color: #f8fafc; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
    .logout-btn:hover { background: #ef4444; }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
}