import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainingRequestService } from '../../services/training-request.service';
import { TrainingRequestDto } from '../../models';

@Component({
  selector: 'app-supervisor-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">Supervisor Review</div>

    <div style="margin-bottom:16px; display:flex; gap:8px;">
      <button class="btn-aqua" [style.background]="showAll ? '#6b7280' : ''" (click)="setView(false)">Pending Action</button>
      <button class="btn-aqua" [style.background]="!showAll ? '#6b7280' : ''" (click)="setView(true)">All My Team's Requests</button>
    </div>

    <div *ngIf="loading" style="padding:20px; text-align:center; color:#6b7280;">Loading...</div>
    <div *ngIf="error" style="padding:20px; text-align:center; color:#dc2626;">{{ error }}</div>

    <ng-container *ngIf="!loading && !error">
      <div *ngFor="let r of requests" class="card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
          <div>
            <h3 style="margin:0 0 4px 0;">{{ r.title }}</h3>
            <p style="color:#6b7280; font-size:.88rem; margin:0;">
              <strong>Employee:</strong> {{ r.employeeName }}
              &nbsp;|&nbsp; <strong>Type:</strong> {{ r.trainingType }}
              &nbsp;|&nbsp; <strong>Dates:</strong> {{ r.proposedStartDate }} to {{ r.proposedEndDate }}
            </p>
          </div>
          <span class="status-badge" [ngClass]="'status-' + (r.status | lowercase).replaceAll('_','-')">{{ r.status }}</span>
        </div>

        <p *ngIf="r.description" style="margin:8px 0 4px 0;">{{ r.description }}</p>
        <p *ngIf="r.rejectionReason" style="color:#dc2626; font-size:.85rem; margin:4px 0;"><strong>Rejection Reason:</strong> {{ r.rejectionReason }}</p>

        <ng-container *ngIf="r.status === 'PENDING_SUPERVISOR'">
          <hr style="border:none; border-top:1px solid #e5e7eb; margin:12px 0;" />

          <div style="margin-bottom:8px;">
            <label style="display:block; font-size:.85rem; color:#374151; margin-bottom:4px;">Comments</label>
            <textarea rows="2" [(ngModel)]="comments[r.id]" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;"></textarea>
          </div>

          <div *ngIf="showRejectReason[r.id]" style="margin-bottom:8px;">
            <label style="display:block; font-size:.85rem; color:#374151; margin-bottom:4px;">Rejection Reason <span style="color:#dc2626;">*</span></label>
            <input [(ngModel)]="reasons[r.id]" placeholder="Required" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;" />
          </div>

          <div *ngIf="actionErrors[r.id]" style="color:#dc2626; font-size:.85rem; margin-bottom:8px;">{{ actionErrors[r.id] }}</div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn-aqua" (click)="approve(r.id)">Approve</button>
            <button class="btn-aqua" style="background:#111827;" (click)="toggleReject(r.id)">
              {{ showRejectReason[r.id] ? 'Cancel' : 'Reject' }}
            </button>
            <button *ngIf="showRejectReason[r.id]" class="btn-aqua" style="background:#dc2626;" (click)="reject(r.id)">Confirm Reject</button>
            <button class="btn-aqua" style="background:#6b7280;" (click)="view(r.id)">View Details</button>
          </div>
        </ng-container>

        <div *ngIf="r.status !== 'PENDING_SUPERVISOR'" style="margin-top:10px;">
          <button class="btn-aqua" style="background:#6b7280;" (click)="view(r.id)">View Details</button>
        </div>
      </div>

      <div *ngIf="requests.length === 0" class="card" style="text-align:center; color:#6b7280;">
        {{ showAll ? 'No requests found for your team.' : 'No pending requests awaiting your review.' }}
      </div>
    </ng-container>
  `,
  styles: [`
    .status-badge { padding:3px 10px; border-radius:12px; font-size:.78rem; font-weight:600; }
    .status-pending-supervisor { background:#fef3c7; color:#92400e; }
    .status-supervisor-approved { background:#dbeafe; color:#1e40af; }
    .status-hr-approved { background:#d1fae5; color:#065f46; }
    .status-rejected { background:#fee2e2; color:#991b1b; }
    .status-rescheduled { background:#ede9fe; color:#5b21b6; }
  `]
})
export class SupervisorReviewComponent implements OnInit {
  requests: TrainingRequestDto[] = [];
  loading = true;
  error = '';
  showAll = false;

  comments: Record<number, string> = {};
  reasons: Record<number, string> = {};
  showRejectReason: Record<number, boolean> = {};
  actionErrors: Record<number, string> = {};

  constructor(
    private service: TrainingRequestService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() { this.loadRequests(); }

  setView(all: boolean) {
    this.showAll = all;
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.error = '';
    const obs = this.showAll ? this.service.getSupervisorAll() : this.service.getSupervisorPending();
    obs.subscribe({
      next: (r) => this.ngZone.run(() => { this.requests = r; this.loading = false; this.cdr.detectChanges(); }),
      error: (err) => this.ngZone.run(() => { this.error = err.error?.message || 'Failed to load requests'; this.loading = false; this.cdr.detectChanges(); })
    });
  }

  toggleReject(id: number) {
    this.showRejectReason[id] = !this.showRejectReason[id];
    this.actionErrors[id] = '';
  }

  approve(id: number) {
    this.actionErrors[id] = '';
    this.service.supervisorAction(id, { action: 'APPROVE', comments: this.comments[id] }).subscribe({
      next: () => this.ngZone.run(() => { this.loadRequests(); this.cdr.detectChanges(); }),
      error: (err) => this.ngZone.run(() => { this.actionErrors[id] = err.error?.message || 'Action failed'; this.cdr.detectChanges(); })
    });
  }

  reject(id: number) {
    if (!this.reasons[id]?.trim()) {
      this.actionErrors[id] = 'Rejection reason is required';
      return;
    }
    this.actionErrors[id] = '';
    this.service.supervisorAction(id, { action: 'REJECT', reason: this.reasons[id], comments: this.comments[id] }).subscribe({
      next: () => this.ngZone.run(() => { this.loadRequests(); this.cdr.detectChanges(); }),
      error: (err) => this.ngZone.run(() => { this.actionErrors[id] = err.error?.message || 'Action failed'; this.cdr.detectChanges(); })
    });
  }

  view(id: number) { this.router.navigate(['/requests', id]); }
}
