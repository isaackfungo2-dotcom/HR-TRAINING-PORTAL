import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <img src="/gcla-logo.png" alt="GCLA Logo" class="login-logo" />
          <h2>HR Training Portal</h2>
          <p>Sign in to your account</p>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="you@company.com" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••" />
        </div>
        <button class="btn-aqua login-btn" (click)="login()">Sign In</button>
        <div class="login-hint">
          <small>Demo accounts: admin@hrportal.com / admin123, hr@hrportal.com / hr123, supervisor@hrportal.com / supervisor123, alice@hrportal.com / alice123</small>
        </div>
        <div *ngIf="error" class="error">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { display:flex; align-items:center; justify-content:center; min-height:100vh; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding:16px; box-sizing:border-box; }
    .login-card { background:#fff; padding:32px; border-radius:12px; width:360px; max-width:100%; box-shadow:0 10px 30px rgba(0,0,0,.15); box-sizing:border-box; }
    .login-header { text-align:center; margin-bottom:20px; }
    .login-logo { width:120px; height:auto; margin-bottom:12px; }
    .login-header h2 { margin:0; color:#111827; }
    .login-header p { margin:6px 0 0; color:#6b7280; }
    .form-group { margin-bottom:14px; }
    .form-group label { display:block; font-size:.85rem; color:#374151; margin-bottom:4px; }
    .form-group input { width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; }
    .login-btn { width:100%; margin-top:6px; }
    .login-hint { margin-top:10px; color:#6b7280; font-size:.78rem; }
    .error { color:#dc2626; font-size:.85rem; margin-top:8px; }
    @media (max-width: 480px) {
      .login-card { padding: 20px; }
      .login-header h2 { font-size: 1.25rem; }
    }
  `]
})
export class LoginComponent {
  email = 'alice@hrportal.com';
  password = 'alice123';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.error = 'Invalid email or password'
    });
  }
}
