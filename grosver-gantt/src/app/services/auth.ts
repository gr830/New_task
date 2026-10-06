import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  login(password: string): boolean {
    // Пароль для входа: admin123
    if (password === 'admin123') {
      localStorage.setItem('token', 'dummy-jwt-token');
      this.loggedIn.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
  }
}