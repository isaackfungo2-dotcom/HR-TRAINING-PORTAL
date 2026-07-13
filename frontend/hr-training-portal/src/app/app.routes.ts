import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MyRequestsComponent } from './pages/my-requests/my-requests.component';
import { NewRequestComponent } from './pages/new-request/new-request.component';
import { SupervisorReviewComponent } from './pages/supervisor-review/supervisor-review.component';
import { HrReviewComponent } from './pages/hr-review/hr-review.component';
import { UsersComponent } from './pages/users/users.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { RequestDetailComponent } from './pages/request-detail/request-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'requests', component: MyRequestsComponent, canActivate: [authGuard] },
  { path: 'requests/:id', component: RequestDetailComponent, canActivate: [authGuard] },
  { path: 'new-request', component: NewRequestComponent, canActivate: [authGuard] },
  { path: 'supervisor', component: SupervisorReviewComponent, canActivate: [authGuard] },
  { path: 'hr-review', component: HrReviewComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
