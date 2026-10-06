import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // <-- Заметьте, styleUrls с буквой "s"
})
export class LoginComponent {
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  doLogin() {
    if (this.authService.login(this.password)) {
      this.router.navigate(['/gantt']);
    } else {
      alert('Неверный пароль');
    }
  }
}