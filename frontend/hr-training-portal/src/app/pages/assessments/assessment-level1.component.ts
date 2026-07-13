import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { TrainingAssessmentDto, AssessmentLevel1Data } from '../../models';

@Component({
  selector: 'app-assessment-level1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assessment-form">
      <div class="form-header">
        <h3>Level 1 – Participant Reaction Survey</h3>
        <p style="color:#6b7280; font-size:.88rem; margin:2px 0 0;">HRA.F.15 &nbsp;|&nbsp; To be completed immediately after training</p>
      </div>

      <div *ngIf="submitted" class="submitted-banner">
        ✓ Level 1 Assessment submitted successfully
      </div>
      <div *ngIf="error" style="color:#dc2626; margin-bottom:12px;">{{ error }}</div>

      <ng-container *ngIf="!readonly">

        <div class="section">
          <div class="form-row">
            <div class="form-group">
              <label>Training Title</label>
              <input [(ngModel)]="form.trainingTitle" placeholder="Enter training title" />
            </div>
            <div class="form-group">
              <label>Date of Training</label>
              <input type="date" [(ngModel)]="form.dateOfTraining" />
            </div>
            <div class="form-group">
              <label>Trainer / Facilitator</label>
              <input [(ngModel)]="form.trainer" placeholder="Trainer name" />
            </div>
          </div>
        </div>

        <div class="section">
          <h4>Please rate the following statements (1 = Strongly Disagree, 5 = Strongly Agree)</h4>
          <div class="rating-table">
            <div class="rating-header">
              <span class="statement-col">Statement</span>
              <span *ngFor="let l of ratingLabels" class="rating-col">{{ l }}</span>
            </div>
            <div class="rating-row" *ngFor="let stmt of statements">
              <span class="statement-col">{{ stmt.label }}</span>
              <span *ngFor="let v of [1,2,3,4,5]" class="rating-col">
                <input type="radio" [name]="stmt.key" [value]="v" [(ngModel)]="form[stmt.key]" />
              </span>
            </div>
          </div>
        </div>

        <div class="section">
          <h4>Open-Ended Questions</h4>
          <div class="form-group">
            <label>1. What did you like most about the training?</label>
            <textarea rows="3" [(ngModel)]="form.likedMost" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>2. What could be improved?</label>
            <textarea rows="3" [(ngModel)]="form.improvements" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>3. Additional comments or suggestions</label>
            <textarea rows="3" [(ngModel)]="form.additionalComments" placeholder="Your response..."></textarea>
          </div>
          <div class="form-group">
            <label>4. Would you recommend this training to others?</label>
            <div class="radio-row">
              <label><input type="radio" name="recommend" [value]="true" [(ngModel)]="form.wouldRecommend" /> Yes</label>
              <label><input type="radio" name="recommend" [value]="false" [(ngModel)]="form.wouldRecommend" /> No</label>
            </div>
            <textarea rows="2" [(ngModel)]="form.recommendComments" placeholder="Comments (optional)..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-aqua" style="background:#6b7280;" (click)="saveDraft()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Draft' }}
          </button>
          <button class="btn-aqua" (click)="onSubmit()" [disabled]="saving">
            {{ saving ? 'Submitting...' : 'Submit Assessment' }}
          </button>
        </div>
      </ng-container>

      <ng-container *ngIf="readonly && assessment">
        <div class="readonly-view">
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">Training Title</span><span>{{ data?.trainingTitle }}</span></div>
            <div class="detail-item"><span class="detail-label">Date</span><span>{{ data?.dateOfTraining }}</span></div>
            <div class="detail-item"><span class="detail-label">Trainer</span><span>{{ data?.trainer }}</span></div>
          </div>
          <div class="rating-table" style="margin-top:16px;">
            <div class="rating-header">
              <span class="statement-col">Statement</span>
              <span *ngFor="let l of ratingLabels" class="rating-col">{{ l }}</span>
            </div>
            <div class="rating-row" *ngFor="let stmt of statements">
              <span class="statement-col">{{ stmt.label }}</span>
              <span *ngFor="let v of [1,2,3,4,5]" class="rating-col">
                <span [class.selected-rating]="data && data[stmt.key] === v">{{ v }}</span>
              </span>
            </div>
          </div>
          <div style="margin-top:16px;" *ngIf="data">
            <p><strong>Liked most:</strong> {{ data.likedMost }}</p>
            <p><strong>Could improve:</strong> {{ data.improvements }}</p>
            <p><strong>Comments:</strong> {{ data.additionalComments }}</p>
            <p><strong>Would recommend:</strong> {{ data.wouldRecommend ? 'Yes' : 'No' }} — {{ data.recommendComments }}</p>
          </div>
          <div *ngIf="assessment.status === 'REVIEWED'" style="margin-top:12px; padding:10px; background:#dbeafe; border-radius:6px;">
            <strong>HR Comments:</strong> {{ assessment.hrComments }}
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .assessment-form { padding: 0; }
    .form-header { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #06b6d4; }
    .form-header h3 { margin: 0; color: #111827; }
    .section { margin-bottom: 24px; }
    .section h4 { color: #374151; margin-bottom: 12px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 14px; }
    .form-group label { font-size: .85rem; font-weight: 600; color: #374151; margin-bottom: 4px; }
    .form-group input, .form-group textarea { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: .9rem; box-sizing: border-box; width: 100%; }
    .form-group textarea { resize: vertical; }
    .rating-table { width: 100%; border-collapse: collapse; }
    .rating-header, .rating-row { display: flex; align-items: center; padding: 8px 4px; border-bottom: 1px solid #f3f4f6; }
    .rating-header { background: #f9fafb; font-weight: 600; font-size: .82rem; color: #6b7280; }
    .statement-col { flex: 1; font-size: .88rem; }
    .rating-col { width: 90px; text-align: center; font-size: .82rem; }
    .radio-row { display: flex; gap: 20px; margin-bottom: 8px; }
    .radio-row label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .submitted-banner { background: #d1fae5; color: #065f46; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-weight: 600; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px; }
    .detail-item { display: flex; flex-direction: column; }
    .detail-label { font-size: .78rem; font-weight: 600; color: #6b7280; text-transform: uppercase; }
    .selected-rating { font-weight: 700; color: #06b6d4; background: #cffafe; border-radius: 4px; padding: 2px 6px; }
    .readonly-view p { margin: 6px 0; font-size: .9rem; }
  `]
})
export class AssessmentLevel1Component implements OnInit {
  @Input() requestId!: number;
  @Input() assessment: TrainingAssessmentDto | null = null;
  @Input() readonly = false;
  @Output() submitted$ = new EventEmitter<TrainingAssessmentDto>();

  form: AssessmentLevel1Data = this.emptyForm();
  data: AssessmentLevel1Data | null = null;
  saving = false;
  submitted = false;
  error = '';

  ratingLabels = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'];
  statements = [
    { key: 'rating_objectivesClear', label: 'The training objectives were clearly defined.' },
    { key: 'rating_contentRelevant', label: 'The content was relevant to my job.' },
    { key: 'rating_trainerKnowledgeable', label: 'The trainer was knowledgeable and engaging.' },
    { key: 'rating_materialsUseful', label: 'The materials provided were useful.' },
    { key: 'rating_willApply', label: 'I will be able to apply what I learned.' },
    { key: 'rating_environment', label: 'The training environment / Refreshments.' },
  ] as { key: keyof AssessmentLevel1Data; label: string }[];

  constructor(
    private service: AssessmentService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (this.assessment?.employeeData) {
      try { this.data = JSON.parse(this.assessment.employeeData); } catch {}
      if (!this.readonly) this.form = { ...this.emptyForm(), ...this.data };
    }
  }

  emptyForm(): AssessmentLevel1Data {
    return {
      trainingTitle: '', dateOfTraining: '', trainer: '',
      rating_objectivesClear: 0, rating_contentRelevant: 0,
      rating_trainerKnowledgeable: 0, rating_materialsUseful: 0,
      rating_willApply: 0, rating_environment: 0,
      likedMost: '', improvements: '', additionalComments: '',
      wouldRecommend: null, recommendComments: ''
    };
  }

  saveDraft() {
    this.saving = true;
    this.service.saveDraft(this.requestId, 1, this.form).subscribe({
      next: () => this.ngZone.run(() => { this.saving = false; this.cdr.detectChanges(); }),
      error: (e) => this.ngZone.run(() => { this.saving = false; this.error = e?.error?.message || 'Save failed'; this.cdr.detectChanges(); })
    });
  }

  onSubmit() {
    this.error = '';
    const ratings = this.statements.map(s => this.form[s.key] as number);
    if (ratings.some(r => !r || r < 1)) { this.error = 'Please rate all statements.'; return; }
    if (this.form.wouldRecommend === null) { this.error = 'Please answer whether you would recommend this training.'; return; }
    this.saving = true;
    this.service.submit(this.requestId, 1, this.form).subscribe({
      next: (res) => this.ngZone.run(() => {
        this.saving = false; this.submitted = true;
        this.submitted$.emit(res); this.cdr.detectChanges();
      }),
      error: (e) => this.ngZone.run(() => { this.saving = false; this.error = e?.error?.message || 'Submit failed'; this.cdr.detectChanges(); })
    });
  }
}
