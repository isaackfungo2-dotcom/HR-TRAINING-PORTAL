import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { TrainingAssessmentDto, AssessmentLevel3EmployeeData, AssessmentLevel3SupervisorData } from '../../models';

@Component({
  selector: 'app-assessment-level3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assessment-form">
      <div class="form-header">
        <h3>Level 3 – Training Impact Assessment</h3>
        <p style="color:#6b7280; font-size:.88rem; margin:2px 0 0;">HRA.F.17 &nbsp;|&nbsp; Part A: Employee &nbsp;|&nbsp; Part B: Supervisor</p>
      </div>

      <div *ngIf="successMsg" class="submitted-banner">✓ {{ successMsg }}</div>
      <div *ngIf="error" style="color:#dc2626; margin-bottom:12px;">{{ error }}</div>

      <!-- PART A: EMPLOYEE -->
      <ng-container *ngIf="!readonly">
        <div class="part-label">PART A — Employee</div>

        <div class="section">
          <h4>Section 1: Application of Skills and Knowledge</h4>
          <div class="form-group">
            <label>1. Since the training, how often have you applied the new skills in your daily work?</label>
            <div class="radio-group">
              <label *ngFor="let opt of frequencyOpts; let i = index">
                <input type="radio" name="freq" [value]="i+1" [(ngModel)]="empForm.applicationFrequency" /> {{ opt }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>2. Which specific concepts or skills from the training are you currently using?</label>
            <textarea rows="3" [(ngModel)]="empForm.specificConceptsApplied" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>3. How confident do you feel when applying the skills learned?</label>
            <div class="radio-group">
              <label *ngFor="let opt of appConfidenceOpts; let i = index">
                <input type="radio" name="appConf" [value]="i+1" [(ngModel)]="empForm.applicationConfidence" /> {{ opt }}
              </label>
            </div>
          </div>
        </div>

        <div class="section">
          <h4>Section 2: Behavioral Change</h4>
          <div class="form-group">
            <label>4. Compared to before the training, how has your approach to job tasks changed?</label>
            <div class="radio-group">
              <label *ngFor="let opt of behaviorChangeOpts; let i = index">
                <input type="radio" name="behChange" [value]="i+1" [(ngModel)]="empForm.behaviorChange" /> {{ opt }}
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>5. Have you noticed improvements in your work performance due to the training?</label>
            <div class="radio-row">
              <label><input type="radio" name="perfImproved" [value]="true" [(ngModel)]="empForm.performanceImproved" /> Yes</label>
              <label><input type="radio" name="perfImproved" [value]="false" [(ngModel)]="empForm.performanceImproved" /> No</label>
            </div>
            <textarea *ngIf="empForm.performanceImproved" rows="2" [(ngModel)]="empForm.performanceExplanation" placeholder="Please explain..."></textarea>
          </div>
          <div class="form-group">
            <label>6. Have your colleagues or manager commented on changes in your performance?</label>
            <div class="radio-row">
              <label><input type="radio" name="colFeedback" [value]="true" [(ngModel)]="empForm.colleagueFeedback" /> Yes</label>
              <label><input type="radio" name="colFeedback" [value]="false" [(ngModel)]="empForm.colleagueFeedback" /> No</label>
            </div>
            <textarea *ngIf="empForm.colleagueFeedback" rows="2" [(ngModel)]="empForm.colleagueFeedbackDetails" placeholder="What feedback did you receive?"></textarea>
          </div>
        </div>

        <div class="section">
          <h4>Section 3: Barriers and Support</h4>
          <div class="form-group">
            <label>7. Are there any barriers preventing you from using the skills you learned?</label>
            <div class="checkbox-group">
              <label *ngFor="let b of barrierOptions">
                <input type="checkbox" [checked]="empForm.barriers.includes(b)" (change)="toggleBarrier(b)" /> {{ b }}
              </label>
              <label>
                <input type="checkbox" [checked]="showOtherBarrier" (change)="showOtherBarrier = !showOtherBarrier" /> Other:
                <input *ngIf="showOtherBarrier" [(ngModel)]="empForm.barriersOther" placeholder="Specify..." style="margin-left:6px; width:160px; padding:4px; border:1px solid #d1d5db; border-radius:4px;" />
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>8. How supported do you feel by your supervisor in applying what you learned?</label>
            <div class="radio-group">
              <label *ngFor="let opt of supportOpts; let i = index">
                <input type="radio" name="supSupport" [value]="i+1" [(ngModel)]="empForm.supervisorSupport" /> {{ opt }}
              </label>
            </div>
          </div>
        </div>

        <div class="section">
          <h4>Section 4: Suggestions and Feedback</h4>
          <div class="form-group">
            <label>9. What could we do to help you apply the training more effectively?</label>
            <textarea rows="2" [(ngModel)]="empForm.helpToApply" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>10. Any additional comments or suggestions?</label>
            <textarea rows="2" [(ngModel)]="empForm.additionalComments" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>11. How relevant was the training content to your daily work?</label>
            <textarea rows="2" [(ngModel)]="empForm.trainingRelevance" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>12. To what extent did practical activities help you retain and apply the training?</label>
            <textarea rows="2" [(ngModel)]="empForm.practicalActivitiesHelp" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>13. Did your direct manager provide opportunities to apply what you learned?</label>
            <textarea rows="2" [(ngModel)]="empForm.managerOpportunity" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>14. Has your workload allowed you time to implement what you learned?</label>
            <textarea rows="2" [(ngModel)]="empForm.workloadAllowed" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>15. What types of follow-up or reinforcement would help you better apply what you learned?</label>
            <textarea rows="2" [(ngModel)]="empForm.followUpTypes" placeholder="Your response..."></textarea>
          </div>
        </div>

        <div class="form-actions" *ngIf="!employeeSubmitted">
          <button class="btn-aqua" style="background:#6b7280;" (click)="saveDraft()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Draft' }}
          </button>
          <button class="btn-aqua" (click)="submitEmployee()" [disabled]="saving">
            {{ saving ? 'Submitting...' : 'Submit Part A' }}
          </button>
        </div>
        <div *ngIf="employeeSubmitted" class="submitted-banner">✓ Part A submitted. Awaiting supervisor to complete Part B.</div>
      </ng-container>

      <!-- PART B: SUPERVISOR (editable only if employee submitted and current user is supervisor) -->
      <ng-container *ngIf="canSubmitSupervisor">
        <div class="part-label" style="margin-top:24px;">PART B — Supervisor Evaluation</div>
        <div class="section">
          <h4>Section 1: Behavior Change (Rate 1–5, or N/A = 0)</h4>
          <div class="rating-table">
            <div class="rating-header">
              <span class="statement-col">Statement</span>
              <span *ngFor="let l of supRatingLabels" class="rating-col">{{ l }}</span>
            </div>
            <div class="rating-row" *ngFor="let stmt of behaviorStmts; let i = index">
              <span class="statement-col">{{ stmt }}</span>
              <span *ngFor="let v of [1,2,3,4,5]" class="rating-col">
                <input type="radio" [name]="'b'+i" [value]="v" [(ngModel)]="supForm['behavior'+(i+1)]" />
              </span>
            </div>
          </div>
          <h4 style="margin-top:16px;">Section 2: Results &amp; Impact</h4>
          <div class="rating-table">
            <div class="rating-header">
              <span class="statement-col">Statement</span>
              <span *ngFor="let l of supRatingLabels" class="rating-col">{{ l }}</span>
            </div>
            <div class="rating-row" *ngFor="let stmt of resultsStmts; let i = index">
              <span class="statement-col">{{ stmt }}</span>
              <span *ngFor="let v of [1,2,3,4,5]" class="rating-col">
                <input type="radio" [name]="'r'+i" [value]="v" [(ngModel)]="supForm['results'+(i+1)]" />
              </span>
            </div>
          </div>
          <h4 style="margin-top:16px;">Section 3: Support &amp; Environment</h4>
          <div class="rating-table">
            <div class="rating-header">
              <span class="statement-col">Statement</span>
              <span *ngFor="let l of supRatingLabels" class="rating-col">{{ l }}</span>
            </div>
            <div class="rating-row" *ngFor="let stmt of supportStmts; let i = index">
              <span class="statement-col">{{ stmt }}</span>
              <span *ngFor="let v of [1,2,3,4,5]" class="rating-col">
                <input type="radio" [name]="'s'+i" [value]="v" [(ngModel)]="supForm['support'+(i+1)]" />
              </span>
            </div>
          </div>
        </div>
        <div class="section">
          <h4>Section 4: Open-Ended Questions</h4>
          <div class="form-group">
            <label>What positive changes have you observed since the training?</label>
            <textarea rows="3" [(ngModel)]="supForm.positiveChanges" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>Were there areas where the employee has not demonstrated noticeable change?</label>
            <textarea rows="3" [(ngModel)]="supForm.noChangeAreas" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>What additional support does the employee need?</label>
            <textarea rows="3" [(ngModel)]="supForm.additionalSupport" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>Would you recommend this training for other employees? Why or why not?</label>
            <textarea rows="3" [(ngModel)]="supForm.recommendTraining" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>Supervisor Name</label>
            <input [(ngModel)]="supForm.supervisorName" placeholder="Full name" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-aqua" (click)="submitSupervisor()" [disabled]="saving">
            {{ saving ? 'Submitting...' : 'Submit Part B' }}
          </button>
        </div>
      </ng-container>

      <!-- READONLY VIEW -->
      <ng-container *ngIf="readonly && empData">
        <div class="part-label">PART A — Employee</div>
        <div class="readonly-view">
          <p><strong>Application frequency:</strong> {{ frequencyOpts[empData.applicationFrequency - 1] }}</p>
          <p><strong>Skills applied:</strong> {{ empData.specificConceptsApplied }}</p>
          <p><strong>Application confidence:</strong> {{ appConfidenceOpts[empData.applicationConfidence - 1] }}</p>
          <p><strong>Behavior change:</strong> {{ behaviorChangeOpts[empData.behaviorChange - 1] }}</p>
          <p><strong>Performance improved:</strong> {{ empData.performanceImproved ? 'Yes' : 'No' }} {{ empData.performanceExplanation ? '— ' + empData.performanceExplanation : '' }}</p>
          <p><strong>Colleague feedback:</strong> {{ empData.colleagueFeedback ? 'Yes' : 'No' }} {{ empData.colleagueFeedbackDetails ? '— ' + empData.colleagueFeedbackDetails : '' }}</p>
          <p><strong>Barriers:</strong> {{ (empData.barriers || []).join(', ') || 'None' }} {{ empData.barriersOther ? ', ' + empData.barriersOther : '' }}</p>
          <p><strong>Supervisor support:</strong> {{ supportOpts[empData.supervisorSupport - 1] }}</p>
          <p><strong>Help to apply:</strong> {{ empData.helpToApply }}</p>
          <p><strong>Additional comments:</strong> {{ empData.additionalComments }}</p>
          <p><strong>Training relevance:</strong> {{ empData.trainingRelevance }}</p>
          <p><strong>Follow-up types:</strong> {{ empData.followUpTypes }}</p>
        </div>

        <ng-container *ngIf="supData">
          <div class="part-label" style="margin-top:20px;">PART B — Supervisor: {{ supData.supervisorName }}</div>
          <div class="readonly-view">
            <p><strong>Behavior ratings:</strong> {{ supData.behavior1 }}, {{ supData.behavior2 }}, {{ supData.behavior3 }}, {{ supData.behavior4 }}, {{ supData.behavior5 }}, {{ supData.behavior6 }}</p>
            <p><strong>Results ratings:</strong> {{ supData.results1 }}, {{ supData.results2 }}, {{ supData.results3 }}</p>
            <p><strong>Support ratings:</strong> {{ supData.support1 }}, {{ supData.support2 }}, {{ supData.support3 }}</p>
            <p><strong>Positive changes:</strong> {{ supData.positiveChanges }}</p>
            <p><strong>No change areas:</strong> {{ supData.noChangeAreas }}</p>
            <p><strong>Additional support needed:</strong> {{ supData.additionalSupport }}</p>
            <p><strong>Recommend training:</strong> {{ supData.recommendTraining }}</p>
          </div>
        </ng-container>

        <div *ngIf="assessment?.status === 'REVIEWED'" style="margin-top:12px; padding:10px; background:#dbeafe; border-radius:6px;">
          <strong>HR Comments:</strong> {{ assessment?.hrComments }}
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .assessment-form { padding: 0; }
    .form-header { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #06b6d4; }
    .form-header h3 { margin: 0; }
    .part-label { font-size: 1rem; font-weight: 700; color: #fff; background: #111827; padding: 8px 14px; border-radius: 6px; margin-bottom: 16px; }
    .section { margin-bottom: 24px; }
    .section h4 { color: #374151; margin-bottom: 12px; border-left: 3px solid #06b6d4; padding-left: 8px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: .88rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-group input, .form-group textarea, .form-group select { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: .9rem; box-sizing: border-box; width: 100%; }
    .form-group textarea { resize: vertical; }
    .radio-group { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
    .radio-group label { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: .88rem; }
    .radio-row { display: flex; gap: 20px; margin-bottom: 8px; }
    .radio-row label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .checkbox-group { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
    .checkbox-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: .88rem; }
    .rating-table { width: 100%; }
    .rating-header, .rating-row { display: flex; align-items: center; padding: 8px 4px; border-bottom: 1px solid #f3f4f6; }
    .rating-header { background: #f9fafb; font-weight: 600; font-size: .82rem; color: #6b7280; }
    .statement-col { flex: 1; font-size: .85rem; }
    .rating-col { width: 60px; text-align: center; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .submitted-banner { background: #d1fae5; color: #065f46; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-weight: 600; }
    .readonly-view p { margin: 6px 0; font-size: .9rem; }
  `]
})
export class AssessmentLevel3Component implements OnInit {
  @Input() requestId!: number;
  @Input() assessment: TrainingAssessmentDto | null = null;
  @Input() readonly = false;
  @Input() canSubmitSupervisor = false;
  @Output() submitted$ = new EventEmitter<TrainingAssessmentDto>();

  empForm: AssessmentLevel3EmployeeData = this.emptyEmpForm();
  supForm: AssessmentLevel3SupervisorData = this.emptySupForm();
  empData: AssessmentLevel3EmployeeData | null = null;
  supData: AssessmentLevel3SupervisorData | null = null;

  saving = false;
  employeeSubmitted = false;
  successMsg = '';
  error = '';
  showOtherBarrier = false;

  barrierOptions = ['Lack of time', 'Lack of tools/resources', 'Lack of support from management', 'Not applicable to my role'];
  frequencyOpts = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
  appConfidenceOpts = ['Not confident', 'Somewhat confident', 'Confident', 'Very confident'];
  behaviorChangeOpts = ['Not at all', 'Slightly', 'Moderately', 'Significantly', 'Completely'];
  supportOpts = ['Not supported', 'Somewhat supported', 'Supported', 'Fully supported'];
  supRatingLabels = ['1', '2', '3', '4', '5'];

  behaviorStmts = [
    'The employee applies skills learned in training to their daily tasks.',
    'I have observed an improvement in the employee\'s performance.',
    'The employee demonstrates increased confidence in handling training-related situations.',
    'The employee proactively shares knowledge or best practices learned.',
    'The employee\'s communication has improved as a result of the training.',
    'The employee\'s decision-making or problem-solving has improved.',
  ];
  resultsStmts = [
    'The training has positively impacted team productivity or efficiency.',
    'Customer or client feedback has improved for this employee.',
    'The employee contributes more effectively in meetings or team projects.',
  ];
  supportStmts = [
    'The employee had the opportunity to apply the new skills.',
    'I have provided support to help reinforce the new behaviours.',
    'The work environment supports the continued use of these new skills.',
  ];

  constructor(private service: AssessmentService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    if (this.assessment?.employeeData) {
      try { this.empData = JSON.parse(this.assessment.employeeData); } catch {}
      if (!this.readonly && this.empData) this.empForm = { ...this.emptyEmpForm(), ...this.empData };
    }
    if (this.assessment?.supervisorData) {
      try { this.supData = JSON.parse(this.assessment.supervisorData); } catch {}
    }
    if (this.assessment?.status === 'SUBMITTED' || this.assessment?.status === 'SUPERVISOR_SUBMITTED' || this.assessment?.status === 'REVIEWED') {
      this.employeeSubmitted = true;
    }
  }

  toggleBarrier(b: string) {
    const idx = this.empForm.barriers.indexOf(b);
    if (idx >= 0) this.empForm.barriers.splice(idx, 1);
    else this.empForm.barriers.push(b);
  }

  emptyEmpForm(): AssessmentLevel3EmployeeData {
    return {
      applicationFrequency: 0, specificConceptsApplied: '', applicationConfidence: 0,
      behaviorChange: 0, performanceImproved: null, performanceExplanation: '',
      colleagueFeedback: null, colleagueFeedbackDetails: '',
      barriers: [], barriersOther: '', supervisorSupport: 0,
      helpToApply: '', additionalComments: '', trainingRelevance: '',
      practicalActivitiesHelp: '', managerOpportunity: '', workloadAllowed: '', followUpTypes: ''
    };
  }

  emptySupForm(): AssessmentLevel3SupervisorData {
    return {
      supervisorName: '',
      behavior1: 0, behavior2: 0, behavior3: 0, behavior4: 0, behavior5: 0, behavior6: 0,
      results1: 0, results2: 0, results3: 0,
      support1: 0, support2: 0, support3: 0,
      positiveChanges: '', noChangeAreas: '', additionalSupport: '', recommendTraining: ''
    };
  }

  saveDraft() {
    this.saving = true;
    this.service.saveDraft(this.requestId, 3, this.empForm).subscribe({
      next: () => this.ngZone.run(() => { this.saving = false; this.cdr.detectChanges(); }),
      error: (e) => this.ngZone.run(() => { this.saving = false; this.error = e?.error?.message || 'Save failed'; this.cdr.detectChanges(); })
    });
  }

  submitEmployee() {
    this.error = '';
    if (!this.empForm.applicationFrequency) { this.error = 'Please answer question 1.'; return; }
    if (!this.empForm.applicationConfidence) { this.error = 'Please answer question 3.'; return; }
    if (!this.empForm.behaviorChange) { this.error = 'Please answer question 4.'; return; }
    this.saving = true;
    this.service.submit(this.requestId, 3, this.empForm).subscribe({
      next: (res) => this.ngZone.run(() => {
        this.saving = false; this.employeeSubmitted = true;
        this.successMsg = 'Part A submitted. Awaiting supervisor to complete Part B.';
        this.submitted$.emit(res); this.cdr.detectChanges();
      }),
      error: (e) => this.ngZone.run(() => { this.saving = false; this.error = e?.error?.message || 'Submit failed'; this.cdr.detectChanges(); })
    });
  }

  submitSupervisor() {
    this.error = '';
    if (!this.supForm.supervisorName.trim()) { this.error = 'Please enter the supervisor name.'; return; }
    if (!this.assessment?.id) return;
    this.saving = true;
    this.service.supervisorSubmit(this.assessment.id, this.supForm).subscribe({
      next: (res) => this.ngZone.run(() => {
        this.saving = false;
        this.successMsg = 'Part B submitted successfully.';
        this.submitted$.emit(res); this.cdr.detectChanges();
      }),
      error: (e) => this.ngZone.run(() => { this.saving = false; this.error = e?.error?.message || 'Submit failed'; this.cdr.detectChanges(); })
    });
  }
}
