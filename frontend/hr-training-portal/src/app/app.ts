import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  userName = '';
  userRole = '';
  sidebarOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.checkAuth();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  checkAuth() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.authService.me().subscribe({
        next: (u) => {
          this.userName = `${u.firstName} ${u.lastName}`;
          this.userRole = u.role;
        },
        error: () => {
          this.authService.removeToken();
          this.isLoggedIn = false;
          this.router.navigate(['/login']);
        }
      });
    }
  }

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
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
