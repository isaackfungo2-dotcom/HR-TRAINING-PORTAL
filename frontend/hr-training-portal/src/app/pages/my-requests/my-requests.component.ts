import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TrainingRequestService } from '../../services/training-request.service';
import { TrainingRequestDto } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-title">My Training Requests</div>
    <div class="card">
      <div *ngIf="loading" style="padding:20px; text-align:center; color:#6b7280;">Loading...</div>
      <div *ngIf="error" style="padding:20px; text-align:center; color:#dc2626;">{{ error }}</div>
      <div *ngIf="!loading && !error">
        <div class="table-wrapper">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Dates</th><th>Status</th><th>Cost</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of requests">
                <td>{{ r.id }}</td>
                <td>{{ r.title }}</td>
                <td>{{ r.trainingType }}</td>
                <td>{{ r.proposedStartDate }} to {{ r.proposedEndDate }}</td>
                <td><span class="status-badge" [ngClass]="'status-'+ (r.status | lowercase).replaceAll('_','-')">{{ r.status }}</span></td>
                <td>{{ formatCost(r) }}</td>
                <td><button class="btn-aqua" style="padding:4px 10px; font-size:.8rem;" (click)="view(r.id)">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="requests.length === 0" style="padding:20px; text-align:center; color:#6b7280;">No training requests found.</div>
      </div>
    </div>
  `,
  styles: [``]
})
export class MyRequestsComponent implements OnInit, OnDestroy {
  requests: TrainingRequestDto[] = [];
  error = '';
  loading = true;
  private sub?: Subscription;
  private timeoutId?: ReturnType<typeof setTimeout>;

  constructor(
    private service: TrainingRequestService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.timeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        if (this.loading) {
          this.error = 'Request timed out. Please refresh the page.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }, 10000);

    this.ngZone.run(() => {
      this.sub = this.service.getMyRequests().subscribe({
        next: (r) => {
          this.ngZone.run(() => {
            clearTimeout(this.timeoutId);
            this.requests = r;
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            clearTimeout(this.timeoutId);
            console.error('getMyRequests error:', err);
            this.error = err?.error?.message || err?.message || 'Failed to load. Check console (F12).';
            this.loading = false;
            this.cdr.detectChanges();
          });
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    clearTimeout(this.timeoutId);
  }
  view(id?: number) { if (id) this.router.navigate(['/requests', id]); }
  formatCost(r: TrainingRequestDto): string {
    if (!r.estimatedCost) return '';
    if (r.currency === 'TZS') {
      return 'TZS ' + r.estimatedCost.toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: r.currency || 'USD' }).format(r.estimatedCost);
  }
}
