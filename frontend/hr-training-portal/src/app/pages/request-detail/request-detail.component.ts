import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingRequestService } from '../../services/training-request.service';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../services/auth.service';
import { TrainingRequestDto, AuditLogDto, TrainingAssessmentDto } from '../../models';
import { AssessmentLevel1Component } from '../assessments/assessment-level1.component';
import { AssessmentLevel2Component } from '../assessments/assessment-level2.component';
import { AssessmentLevel3Component } from '../assessments/assessment-level3.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AssessmentLevel1Component, AssessmentLevel2Component, AssessmentLevel3Component],
  template: `
    <div class="page-title">Request Detail</div>

    <div *ngIf="loading" style="padding:20px; text-align:center; color:#6b7280;">Loading...</div>
    <div *ngIf="error" style="padding:20px; text-align:center; color:#dc2626;">{{ error }}</div>

    <ng-container *ngIf="!loading && !error && request">

      <!-- Request Info Card -->
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
          <h2 style="margin:0;">{{ request.title }}</h2>
          <span class="status-badge" [ngClass]="'status-' + (request.status | lowercase).replaceAll('_','-')">{{ request.status }}</span>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">Employee</span><span>{{ request.employeeName }}</span></div>
          <div class="detail-item"><span class="detail-label">Department</span><span>{{ request.departmentName || '—' }}</span></div>
          <div class="detail-item"><span class="detail-label">Supervisor</span><span>{{ request.supervisorName || '—' }}</span></div>
          <div class="detail-item"><span class="detail-label">Training Type</span><span>{{ request.trainingType }}</span></div>
          <div class="detail-item"><span class="detail-label">Provider / Institution</span><span>{{ request.provider || request.institution || '—' }}</span></div>
          <div class="detail-item"><span class="detail-label">Proposed Dates</span><span>{{ request.proposedStartDate }} to {{ request.proposedEndDate }}</span></div>
          <div class="detail-item" *ngIf="request.rescheduledStartDate"><span class="detail-label">Rescheduled Dates</span><span>{{ request.rescheduledStartDate }} to {{ request.rescheduledEndDate }}</span></div>
          <div class="detail-item" *ngIf="request.estimatedCost"><span class="detail-label">Estimated Cost</span><span>{{ formatCost(request) }}</span></div>
          <div class="detail-item"><span class="detail-label">Submitted</span><span>{{ request.createdAt | date:'medium' }}</span></div>
          <div class="detail-item" *ngIf="request.hrApproverName"><span class="detail-label">HR Approver</span><span>{{ request.hrApproverName }}</span></div>
        </div>
        <div *ngIf="request.description" style="margin-top:16px;"><span class="detail-label">Description</span><p style="margin:4px 0 0;">{{ request.description }}</p></div>
        <div *ngIf="request.objectives" style="margin-top:12px;"><span class="detail-label">Objectives</span><p style="margin:4px 0 0;">{{ request.objectives }}</p></div>
        <div *ngIf="request.justification" style="margin-top:12px;"><span class="detail-label">Justification</span><p style="margin:4px 0 0;">{{ request.justification }}</p></div>
        <div *ngIf="request.expectedBenefits" style="margin-top:12px;"><span class="detail-label">Expected Benefits</span><p style="margin:4px 0 0;">{{ request.expectedBenefits }}</p></div>
        <div *ngIf="request.rejectionReason" style="margin-top:12px; padding:10px; background:#fee2e2; border-radius:6px;"><span class="detail-label" style="color:#991b1b;">Rejection Reason</span><p style="margin:4px 0 0; color:#991b1b;">{{ request.rejectionReason }}</p></div>
        <div *ngIf="request.rescheduleComment" style="margin-top:12px; padding:10px; background:#ede9fe; border-radius:6px;"><span class="detail-label" style="color:#5b21b6;">Reschedule Comment</span><p style="margin:4px 0 0; color:#5b21b6;">{{ request.rescheduleComment }}</p></div>
      </div>

      <!-- Assessment Section (visible for approved requests) -->
      <div *ngIf="request.status === 'HR_APPROVED' || request.status === 'RESCHEDULED' || hasAnyAssessment" class="card" style="margin-bottom:16px;">
        <h3 style="margin:0 0 8px;">Training Impact Assessments</h3>
        <p style="color:#6b7280; font-size:.88rem; margin:0 0 20px;">Complete all three levels during and after the training period (HRA.F.15, HRA.F.16, HRA.F.17)</p>

        <!-- Level tabs -->
        <div class="level-tabs">
          <button *ngFor="let lvl of [1,2,3]"
            class="level-tab"
            [class.active]="activeLevel === lvl"
            [class.completed]="isLevelSubmitted(lvl)"
            [class.locked]="!isLevelUnlocked(lvl)"
            (click)="activeLevel = lvl">
            <span class="level-num">Level {{ lvl }}</span>
            <span class="level-status">
              <ng-container *ngIf="isLevelSubmitted(lvl)">✓ Submitted</ng-container>
              <ng-container *ngIf="!isLevelSubmitted(lvl) && isLevelUnlocked(lvl)">In Progress</ng-container>
              <ng-container *ngIf="!isLevelUnlocked(lvl)">🔒 Locked</ng-container>
            </span>
          </button>
        </div>

        <!-- Level 1 -->
        <div *ngIf="activeLevel === 1" style="margin-top:20px;">
          <app-assessment-level1
            [requestId]="request.id!"
            [assessment]="getAssessment(1)"
            [readonly]="isLevelSubmitted(1)"
            (submitted$)="onAssessmentSubmitted($event)">
          </app-assessment-level1>
          <ng-container *ngIf="isHr && isLevelSubmitted(1)">
            <div style="margin-top:16px; padding-top:16px; border-top:1px solid #e5e7eb;">
              <strong>HR Review</strong>
              <div *ngIf="getAssessment(1)?.status !== 'REVIEWED'">
                <textarea rows="3" [(ngModel)]="hrComment1" placeholder="Add review comments..." style="width:100%; margin-top:8px; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;"></textarea>
                <button class="btn-aqua" style="margin-top:8px;" (click)="submitHrReview(1)" [disabled]="savingReview">{{ savingReview ? 'Saving...' : 'Save HR Review' }}</button>
              </div>
              <div *ngIf="getAssessment(1)?.status === 'REVIEWED'" style="padding:10px; background:#dbeafe; border-radius:6px; margin-top:8px;">
                <strong>Reviewed:</strong> {{ getAssessment(1)?.hrComments }}
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Level 2 -->
        <div *ngIf="activeLevel === 2" style="margin-top:20px;">
          <div *ngIf="!isLevelUnlocked(2)" style="text-align:center; padding:30px; color:#6b7280;">
            🔒 Complete and submit Level 1 first to unlock Level 2.
          </div>
          <app-assessment-level2 *ngIf="isLevelUnlocked(2)"
            [requestId]="request.id!"
            [assessment]="getAssessment(2)"
            [readonly]="isLevelSubmitted(2)"
            (submitted$)="onAssessmentSubmitted($event)">
          </app-assessment-level2>
          <ng-container *ngIf="isHr && isLevelSubmitted(2)">
            <div style="margin-top:16px; padding-top:16px; border-top:1px solid #e5e7eb;">
              <strong>HR Review</strong>
              <div *ngIf="getAssessment(2)?.status !== 'REVIEWED'">
                <textarea rows="3" [(ngModel)]="hrComment2" placeholder="Add review comments..." style="width:100%; margin-top:8px; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;"></textarea>
                <button class="btn-aqua" style="margin-top:8px;" (click)="submitHrReview(2)" [disabled]="savingReview">{{ savingReview ? 'Saving...' : 'Save HR Review' }}</button>
              </div>
              <div *ngIf="getAssessment(2)?.status === 'REVIEWED'" style="padding:10px; background:#dbeafe; border-radius:6px; margin-top:8px;">
                <strong>Reviewed:</strong> {{ getAssessment(2)?.hrComments }}
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Level 3 -->
        <div *ngIf="activeLevel === 3" style="margin-top:20px;">
          <div *ngIf="!isLevelUnlocked(3)" style="text-align:center; padding:30px; color:#6b7280;">
            🔒 Complete and submit Level 2 first to unlock Level 3.
          </div>
          <app-assessment-level3 *ngIf="isLevelUnlocked(3)"
            [requestId]="request.id!"
            [assessment]="getAssessment(3)"
            [readonly]="getAssessment(3)?.status === 'SUPERVISOR_SUBMITTED' || getAssessment(3)?.status === 'REVIEWED'"
            [canSubmitSupervisor]="canSubmitSupervisorForL3()"
            (submitted$)="onAssessmentSubmitted($event)">
          </app-assessment-level3>
          <ng-container *ngIf="isHr && (getAssessment(3)?.status === 'SUPERVISOR_SUBMITTED' || getAssessment(3)?.status === 'SUBMITTED')">
            <div style="margin-top:16px; padding-top:16px; border-top:1px solid #e5e7eb;">
              <strong>HR Review</strong>
              <div *ngIf="getAssessment(3)?.status !== 'REVIEWED'">
                <textarea rows="3" [(ngModel)]="hrComment3" placeholder="Add review comments..." style="width:100%; margin-top:8px; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box;"></textarea>
                <button class="btn-aqua" style="margin-top:8px;" (click)="submitHrReview(3)" [disabled]="savingReview">{{ savingReview ? 'Saving...' : 'Save HR Review' }}</button>
              </div>
              <div *ngIf="getAssessment(3)?.status === 'REVIEWED'" style="padding:10px; background:#dbeafe; border-radius:6px; margin-top:8px;">
                <strong>Reviewed:</strong> {{ getAssessment(3)?.hrComments }}
              </div>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Activity Log -->
      <div *ngIf="auditLogs.length > 0" class="card" style="margin-bottom:16px;">
        <h3 style="margin:0 0 12px;">Activity Log</h3>
        <div *ngFor="let log of auditLogs" style="padding:10px 0; border-bottom:1px solid #f3f4f6;">
          <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">
            <strong style="font-size:.9rem;">{{ log.action }}</strong>
            <span style="font-size:.8rem; color:#6b7280;">{{ log.timestamp | date:'medium' }}</span>
          </div>
          <p style="margin:4px 0 0; font-size:.85rem; color:#374151;">{{ log.details }}</p>
          <span style="font-size:.8rem; color:#9ca3af;">by {{ log.userName }}</span>
        </div>
      </div>

      <button class="btn-aqua" style="background:#6b7280;" (click)="goBack()">← Back</button>
    </ng-container>
  `,
  styles: [`
    .detail-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap:12px; }
    .detail-item { display:flex; flex-direction:column; }
    .detail-label { font-size:.78rem; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; }
    .status-badge { padding:4px 12px; border-radius:12px; font-size:.8rem; font-weight:600; }
    .status-pending-supervisor { background:#fef3c7; color:#92400e; }
    .status-supervisor-approved { background:#dbeafe; color:#1e40af; }
    .status-hr-approved { background:#d1fae5; color:#065f46; }
    .status-rejected { background:#fee2e2; color:#991b1b; }
    .status-rescheduled { background:#ede9fe; color:#5b21b6; }
    .level-tabs { display:flex; gap:12px; flex-wrap:wrap; }
    .level-tab { display:flex; flex-direction:column; align-items:center; padding:12px 24px; border:2px solid #e5e7eb; border-radius:8px; background:#fff; cursor:pointer; transition:all .2s; min-width:110px; }
    .level-tab.active { border-color:#06b6d4; background:#cffafe; }
    .level-tab.completed { border-color:#22c55e; }
    .level-tab.locked { opacity:.5; cursor:not-allowed; }
    .level-num { font-weight:700; font-size:1rem; color:#111827; }
    .level-status { font-size:.75rem; color:#6b7280; margin-top:4px; }
    .level-tab.completed .level-status { color:#065f46; }
    .level-tab.active .level-status { color:#0891b2; }
  `]
})
export class RequestDetailComponent implements OnInit {
  request: TrainingRequestDto | null = null;
  auditLogs: AuditLogDto[] = [];
  assessments: TrainingAssessmentDto[] = [];
  loading = true;
  error = '';
  activeLevel = 1;
  isHr = false;
  isSupervisor = false;
  savingReview = false;
  hrComment1 = ''; hrComment2 = ''; hrComment3 = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: TrainingRequestService,
    private assessmentService: AssessmentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = 'Invalid request ID'; this.loading = false; return; }

    const role = localStorage.getItem('role') || '';
    this.isHr = role === 'HR' || role === 'ADMIN';
    this.isSupervisor = role === 'SUPERVISOR' || this.isHr;

    this.service.getById(id).subscribe({
      next: (r) => this.ngZone.run(() => { this.request = r; this.loading = false; this.cdr.detectChanges(); }),
      error: (err) => this.ngZone.run(() => { this.error = err?.error?.message || 'Failed to load request'; this.loading = false; this.cdr.detectChanges(); })
    });

    this.service.getAuditLogs(id).subscribe({
      next: (logs) => this.ngZone.run(() => { this.auditLogs = logs; this.cdr.detectChanges(); }),
      error: () => {}
    });

    this.assessmentService.getForRequest(id).subscribe({
      next: (a) => this.ngZone.run(() => {
        this.assessments = a;
        // Pre-populate HR comments from existing reviews
        const a1 = this.getAssessment(1); if (a1) this.hrComment1 = a1.hrComments || '';
        const a2 = this.getAssessment(2); if (a2) this.hrComment2 = a2.hrComments || '';
        const a3 = this.getAssessment(3); if (a3) this.hrComment3 = a3.hrComments || '';
        this.cdr.detectChanges();
      }),
      error: () => {}
    });

    // Store role in localStorage after me() for convenience
    this.authService.me().subscribe({
      next: (u) => this.ngZone.run(() => {
        localStorage.setItem('role', u.role || '');
        this.isHr = u.role === 'HR' || u.role === 'ADMIN';
        this.isSupervisor = u.role === 'SUPERVISOR' || this.isHr;
        this.cdr.detectChanges();
      }),
      error: () => {}
    });
  }

  getAssessment(level: number): TrainingAssessmentDto | null {
    return this.assessments.find(a => a.level === level) || null;
  }

  isLevelSubmitted(level: number): boolean {
    const a = this.getAssessment(level);
    return !!a && a.status !== 'DRAFT';
  }

  isLevelUnlocked(level: number): boolean {
    if (level === 1) return true;
    return this.isLevelSubmitted(level - 1);
  }

  get hasAnyAssessment(): boolean {
    return this.assessments.length > 0;
  }

  canSubmitSupervisorForL3(): boolean {
    const a = this.getAssessment(3);
    return !!a && a.status === 'SUBMITTED' && this.isSupervisor;
  }

  onAssessmentSubmitted(updated: TrainingAssessmentDto) {
    const idx = this.assessments.findIndex(a => a.level === updated.level);
    if (idx >= 0) this.assessments[idx] = updated;
    else this.assessments.push(updated);
    this.cdr.detectChanges();
  }

  submitHrReview(level: number) {
    const a = this.getAssessment(level);
    if (!a?.id) return;
    const comment = level === 1 ? this.hrComment1 : level === 2 ? this.hrComment2 : this.hrComment3;
    this.savingReview = true;
    this.assessmentService.hrReview(a.id, comment).subscribe({
      next: (updated) => this.ngZone.run(() => {
        this.savingReview = false;
        this.onAssessmentSubmitted(updated);
        this.cdr.detectChanges();
      }),
      error: (e) => this.ngZone.run(() => { this.savingReview = false; this.cdr.detectChanges(); })
    });
  }

  goBack() { this.router.navigate(['/requests']); }

  formatCost(r: TrainingRequestDto): string {
    if (!r.estimatedCost) return '';
    if (r.currency === 'TZS') return 'TZS ' + r.estimatedCost.toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: r.currency || 'USD' }).format(r.estimatedCost);
  }
}
