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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'requests', component: MyRequestsComponent },
  { path: 'requests/:id', component: RequestDetailComponent },
  { path: 'new-request', component: NewRequestComponent },
  { path: 'supervisor', component: SupervisorReviewComponent },
  { path: 'hr-review', component: HrReviewComponent },
  { path: 'users', component: UsersComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
