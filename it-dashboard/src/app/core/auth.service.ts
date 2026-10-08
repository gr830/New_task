import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal<boolean>(localStorage.getItem('isLoggedIn') === 'true');
  currentUser = signal<string>(localStorage.getItem('currentUser') || '');

  constructor(private router: Router) {}

  login(user: string, pass: string): boolean {
    if (user === 'admin' && pass === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', user);
      this.isLoggedIn.set(true);
      this.currentUser.set(user);
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    this.isLoggedIn.set(false);
    this.currentUser.set('');
    this.router.navigate(['/login']);
  }
}