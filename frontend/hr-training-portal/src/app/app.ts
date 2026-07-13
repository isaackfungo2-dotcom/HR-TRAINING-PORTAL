import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userName = '';
  userRole = '';
  sidebarOpen = false;

  private authSub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authSub = this.authService.loggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.authService.me().subscribe({
          next: (u) => {
            this.userName = `${u.firstName} ${u.lastName}`;
            this.userRole = u.role;
            localStorage.setItem('role', u.role || '');
          },
          error: () => {
            this.authService.removeToken();
            this.router.navigate(['/login']);
          }
        });
      } else {
        this.userName = '';
        this.userRole = '';
      }
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }

  canSupervise() {
    return this.userRole === 'SUPERVISOR' || this.userRole === 'HR' || this.userRole === 'ADMIN';
  }

  canHr() {
    return this.userRole === 'HR' || this.userRole === 'ADMIN';
  }

  canAdmin() {
    return this.userRole === 'ADMIN';
  }

  logout() {
    this.authService.removeToken();
    this.router.navigate(['/login']);
  }
}
