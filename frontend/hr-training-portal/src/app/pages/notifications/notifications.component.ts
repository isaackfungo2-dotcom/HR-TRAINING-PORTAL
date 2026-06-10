import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-title">Notifications</div>
    <div class="card" style="text-align:center; color:#6b7280;">Notifications page coming soon.</div>
  `,
  styles: [``]
})
export class NotificationsComponent {}
