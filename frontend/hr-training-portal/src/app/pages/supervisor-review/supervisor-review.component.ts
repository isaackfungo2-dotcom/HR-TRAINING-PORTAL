import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingRequestService } from '../../services/training-request.service';
import { TrainingRequestDto } from '../../models';

@Component({
  selector: 'app-supervisor-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">Supervisor Review</div>
    <div class="card" *ngFor="let r of requests">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0;">{{ r.title }}</h3>
        <span class="status-badge status-pending-supervisor">{{ r.status }}</span>
      </div>
      <p style="color:#6b7280; font-size:.9rem; margin:6px 0;">Employee: {{ r.employeeName }} | Type: {{ r.trainingType }} | Dates: {{ r.proposedStartDate }} to {{ r.proposedEndDate }}</p>
      <p style="margin:6px 0;">{{ r.description }}</p>
      <div class="form-group full" style="margin-top:10px;">
        <label>Comments</label>
        <textarea rows="2" [(ngModel)]="comments[r.id!]"></textarea>
      </div>
      <div class="form-group full" style="margin-top:6px;" *ngIf="showRejectReason[r.id!]">
        <label>Rejection Reason (required)</label>
        <input [(ngModel)]="reasons[r.id!]" placeholder="Reason" />
      </div>
      <div style="margin-top:10px; display:flex; gap:8px;">
        <button class="btn-aqua" (click)="approve(r.id!)">Approve</button>
        <button class="btn-aqua" style="background:#111827;" (click)="toggleReject(r.id!)">Reject</button>
        <button *ngIf="showRejectReason[r.id!]" class="btn-aqua" style="background:#dc2626;" (click)="reject(r.id!)">Confirm Reject</button>
      </div>
    </div>
    <div *ngIf="requests.length === 0" class="card" style="text-align:center; color:#6b7280;">No pending requests for supervisor review.</div>
  `,
  styles: [``]
})
export class SupervisorReviewComponent implements OnInit {
  requests: TrainingRequestDto[] = [];
  comments: Record<number, string> = {};
  reasons: Record<number, string> = {};
  showRejectReason: Record<number, boolean> = {};

  constructor(private service: TrainingRequestService) {}

  ngOnInit() { this.service.getSupervisorPending().subscribe(r => this.requests = r); }

  toggleReject(id: number) { this.showRejectReason[id] = !this.showRejectReason[id]; }

  approve(id: number) {
    this.service.supervisorAction(id, { action: 'APPROVE', comments: this.comments[id] }).subscribe(() => this.ngOnInit());
  }

  reject(id: number) {
    this.service.supervisorAction(id, { action: 'REJECT', reason: this.reasons[id], comments: this.comments[id] }).subscribe(() => this.ngOnInit());
  }
}
