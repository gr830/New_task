import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-box">
        <div class="logo">🔐 CMDB IT-Assets</div>
        <h2>Вход в панель администратора</h2>
        <p class="subtitle">Учет оборудования, лицензий и топологии связей</p>

        @if (error) {
          <div class="error-alert">{{ error }}</div>
        }

        <form (submit)="onLogin(); $event.preventDefault()">
          <div class="form-group">
            <label>Логин:</label>
            <input type="text" [(ngModel)]="username" name="username" placeholder="admin" required />
          </div>
          <div class="form-group">
            <label>Пароль:</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="admin123" required />
          </div>
          <button type="submit" class="login-btn">Войти в систему</button>
        </form>
        <div class="hint">По умолчанию: <b>admin</b> / <b>admin123</b></div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; }
    .login-box { background: white; padding: 36px; border-radius: 12px; width: 380px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    .logo { font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 8px; }
    h2 { margin: 0 0 6px; font-size: 20px; color: #1e293b; }
    .subtitle { margin: 0 0 20px; font-size: 13px; color: #64748b; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 4px; }
    input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
    .login-btn { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
    .error-alert { background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 6px; font-size: 13px; margin-bottom: 14px; }
    .hint { margin-top: 16px; font-size: 12px; text-align: center; color: #94a3b8; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  username = '';
  password = '';
  error = '';

  onLogin() {
    if (!this.auth.login(this.username, this.password)) {
      this.error = 'Неверный логин или пароль!';
    }
  }
}