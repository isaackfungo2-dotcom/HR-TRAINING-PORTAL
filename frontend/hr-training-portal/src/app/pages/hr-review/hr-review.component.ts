import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainingRequestService } from '../../services/training-request.service';
import { TrainingRequestDto } from '../../models';

@Component({
  selector: 'app-hr-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">HR Review</div>

    <div style="margin-bottom:16px; display:flex; gap:10px; flex-wrap:wrap;">
      <select [(ngModel)]="filterStatus" (change)="loadRequests()" style="padding:8px; border:1px solid #d1d5db; border-radius:6px;">
        <option value="">All Statuses</option>
        <option value="PENDING_SUPERVISOR">Pending Supervisor</option>
        <option value="SUPERVISOR_APPROVED">Pending HR Review</option>
        <option value="HR_APPROVED">HR Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="RESCHEDULED">Rescheduled</option>
      </select>
      <input [(ngModel)]="filterKeyword" (input)="loadRequests()" placeholder="Search by title or employee..."
        style="padding:8px; border:1px solid #d1d5db; border-radius:6px; min-width:220px;" />
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
              <span *ngIf="r.departmentName"> &mdash; {{ r.departmentName }}</span>
              &nbsp;|&nbsp; <strong>Type:</strong> {{ r.trainingType | lowercase | titlecase }}
              &nbsp;|&nbsp; <strong>Dates:</strong> {{ r.proposedStartDate }} to {{ r.proposedEndDate }}
            </p>
            <p style="color:#6b7280; font-size:.88rem; margin:4px 0 0 0;" *ngIf="r.estimatedCost">
              <strong>Cost:</strong> {{ formatCost(r) }}
              <span *ngIf="r.supervisorName"> &nbsp;|&nbsp; <strong>Supervisor:</strong> {{ r.supervisorName }}</span>
            </p>
          </div>
          <span class="status-badge" [ngClass]="'status-' + (r.status | lowercase).replaceAll('_','-')">{{ r.status }}</span>
        </div>

        <p *ngIf="r.description" style="margin:10px 0 4px 0; font-size:.9rem;">{{ r.description }}</p>
        <p *ngIf="r.justification" style="margin:4px 0; font-size:.85rem; color:#374151;"><strong>Justification:</strong> {{ r.justification }}</p>
        <p *ngIf="r.expectedBenefits" style="margin:4px 0; font-size:.85rem; color:#374151;"><strong>Expected Benefits:</strong> {{ r.expectedBenefits }}</p>
        <p *ngIf="r.rejectionReason" style="margin:4px 0; font-size:.85rem; color:#dc2626;"><strong>Rejection Reason:</strong> {{ r.rejectionReason }}</p>

        <ng-container *ngIf="r.status === 'SUPERVISOR_APPROVED'">
          <hr style="border:none; border-top:1px solid #e5e7eb; margin:12px 0;" />

          <div class="form-group" style="margin-bottom:8px;">
            <label style="display:block; font-size:.85rem; color:#374151; margin-bottom:4px;">Comments</label>
            <textarea rows="2" [(ngModel)]="comments[r.id]" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;"></textarea>
          </div>

          <div *ngIf="showRejectReason[r.id]" class="form-group" style="margin-bottom:8px;">
            <label style="display:block; font-size:.85rem; color:#374151; margin-bottom:4px;">Rejection Reason <span style="color:#dc2626;">*</span></label>
            <input [(ngModel)]="reasons[r.id]" placeholder="Required" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;" />
          </div>

          <div *ngIf="showReschedule[r.id]" style="margin-bottom:8px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="display:block; font-size:.85rem; color:#374151; margin-bottom:4px;">New Start Date <span style="color:#dc2626;">*</span></label>
              <input type="date" [(ngModel)]="newStartDate[r.id]" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="display:block; font-size:.85rem; color:#374151; margin-bottom:4px;">New End Date <span style="color:#dc2626;">*</span></label>
              <input type="date" [(ngModel)]="newEndDate[r.id]" style="width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;" />
            </div>
          </div>

          <div *ngIf="actionErrors[r.id]" style="color:#dc2626; font-size:.85rem; margin-bottom:8px;">{{ actionErrors[r.id] }}</div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn-aqua" (click)="approve(r.id)">Approve</button>
            <button class="btn-aqua" style="background:#f59e0b;" (click)="toggleReschedule(r.id)">
              {{ showReschedule[r.id] ? 'Cancel Reschedule' : 'Reschedule' }}
            </button>
            <button *ngIf="showReschedule[r.id]" class="btn-aqua" style="background:#f59e0b;" (click)="reschedule(r.id)">Confirm Reschedule</button>
            <button class="btn-aqua" style="background:#111827;" (click)="toggleReject(r.id)">
              {{ showRejectReason[r.id] ? 'Cancel Reject' : 'Reject' }}
            </button>
            <button *ngIf="showRejectReason[r.id]" class="btn-aqua" style="background:#dc2626;" (click)="reject(r.id)">Confirm Reject</button>
            <button class="btn-aqua" style="background:#6b7280;" (click)="view(r.id)">View Details</button>
          </div>
        </ng-container>

        <div *ngIf="r.status !== 'SUPERVISOR_APPROVED'" style="margin-top:10px;">
          <button class="btn-aqua" style="background:#6b7280;" (click)="view(r.id)">View Details</button>
        </div>
      </div>

      <div *ngIf="requests.length === 0" class="card" style="text-align:center; color:#6b7280;">
        No requests found.
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
export class HrReviewComponent implements OnInit {
  requests: TrainingRequestDto[] = [];
  loading = true;
  error = '';
  filterStatus = 'SUPERVISOR_APPROVED';
  filterKeyword = '';

  comments: Record<number, string> = {};
  reasons: Record<number, string> = {};
  newStartDate: Record<number, string> = {};
  newEndDate: Record<number, string> = {};
  showRejectReason: Record<number, boolean> = {};
  showReschedule: Record<number, boolean> = {};
  actionErrors: Record<number, string> = {};

  constructor(
    private service: TrainingRequestService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() { this.loadRequests(); }

  loadRequests() {
    this.loading = true;
    this.error = '';
    this.service.getAll(this.filterStatus || undefined, undefined, this.filterKeyword || undefined).subscribe({
      next: (r) => this.ngZone.run(() => { this.requests = r; this.loading = false; this.cdr.detectChanges(); }),
      error: (err) => this.ngZone.run(() => { this.error = err.error?.message || 'Failed to load requests'; this.loading = false; this.cdr.detectChanges(); })
    });
  }

  toggleReject(id: number) {
    this.showRejectReason[id] = !this.showRejectReason[id];
    this.showReschedule[id] = false;
    this.actionErrors[id] = '';
  }

  toggleReschedule(id: number) {
    this.showReschedule[id] = !this.showReschedule[id];
    this.showRejectReason[id] = false;
    this.actionErrors[id] = '';
  }

  approve(id: number) {
    this.actionErrors[id] = '';
    this.service.hrAction(id, { action: 'APPROVE', comments: this.comments[id] }).subscribe({
      next: () => this.loadRequests(),
      error: (err) => this.actionErrors[id] = err.error?.message || 'Action failed'
    });
  }

  reject(id: number) {
    if (!this.reasons[id]?.trim()) {
      this.actionErrors[id] = 'Rejection reason is required';
      return;
    }
    this.actionErrors[id] = '';
    this.service.hrAction(id, { action: 'REJECT', reason: this.reasons[id], comments: this.comments[id] }).subscribe({
      next: () => this.loadRequests(),
      error: (err) => this.actionErrors[id] = err.error?.message || 'Action failed'
    });
  }

  reschedule(id: number) {
    if (!this.newStartDate[id] || !this.newEndDate[id]) {
      this.actionErrors[id] = 'Both new start and end dates are required';
      return;
    }
    this.actionErrors[id] = '';
    this.service.hrAction(id, {
      action: 'RESCHEDULE',
      newStartDate: this.newStartDate[id],
      newEndDate: this.newEndDate[id],
      comments: this.comments[id]
    }).subscribe({
      next: () => this.loadRequests(),
      error: (err) => this.actionErrors[id] = err.error?.message || 'Action failed'
    });
  }

  view(id: number) { this.router.navigate(['/requests', id]); }

  formatCost(r: TrainingRequestDto): string {
    if (!r.estimatedCost) return '';
    if (r.currency === 'TZS') {
      return 'TZS ' + r.estimatedCost.toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: r.currency || 'USD' }).format(r.estimatedCost);
  }
}
