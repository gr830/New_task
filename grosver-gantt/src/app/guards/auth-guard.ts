import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    let isAuthenticated = false;
    
    // Явно указываем (val: boolean), чтобы удовлетворить TypeScript
    this.authService.isLoggedIn.subscribe((val: boolean) => {
      isAuthenticated = val;
    });
    
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}