import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-title">Request Detail</div>
    <div class="card" style="text-align:center; color:#6b7280;">Request detail for ID {{ id }} coming soon.</div>
  `,
  styles: [``]
})
export class RequestDetailComponent {
  id: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
