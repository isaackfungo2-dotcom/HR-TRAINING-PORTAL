import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { TrainingAssessmentDto, AssessmentLevel2Data } from '../../models';

@Component({
  selector: 'app-assessment-level2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assessment-form">
      <div class="form-header">
        <h3>Level 2 – Learning Evaluation</h3>
        <p style="color:#6b7280; font-size:.88rem; margin:2px 0 0;">HRA.F.16 &nbsp;|&nbsp; To be completed during training</p>
      </div>

      <div *ngIf="submitted" class="submitted-banner">✓ Level 2 Assessment submitted successfully</div>
      <div *ngIf="error" style="color:#dc2626; margin-bottom:12px;">{{ error }}</div>

      <ng-container *ngIf="!readonly">

        <div class="section">
          <h4>Section 1: Knowledge Acquisition</h4>

          <div class="form-group">
            <label>1. How confident are you in applying the knowledge gained?</label>
            <div class="radio-group">
              <label *ngFor="let opt of confidenceOpts; let i = index">
                <input type="radio" name="confidence" [value]="i+1" [(ngModel)]="form.confidence" /> {{ opt }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>2. Rate your understanding of the training content</label>
            <div style="margin-top:8px;">
              <span class="sub-label">Before the training:</span>
              <div class="radio-group">
                <label *ngFor="let opt of understandingOpts; let i = index">
                  <input type="radio" name="understandingBefore" [value]="i+1" [(ngModel)]="form.understandingBefore" /> {{ opt }}
                </label>
              </div>
              <span class="sub-label" style="margin-top:8px; display:block;">After the training:</span>
              <div class="radio-group">
                <label *ngFor="let opt of understandingOpts; let i = index">
                  <input type="radio" name="understandingAfter" [value]="i+1" [(ngModel)]="form.understandingAfter" /> {{ opt }}
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>3. What are the three most important things you learned?</label>
            <textarea rows="4" [(ngModel)]="form.topThingsLearned" placeholder="1. ...&#10;2. ...&#10;3. ..."></textarea>
          </div>
        </div>

        <div class="section">
          <h4>Section 2: Skill Development</h4>

          <div class="form-group">
            <label>4. How much have your skills improved? (Rate each 1–5, where 1 = No improvement, 5 = Significant improvement)</label>
            <div class="skill-row">
              <input [(ngModel)]="form.skill1Topic" placeholder="Topic / Skill 1" style="flex:1;" />
              <select [(ngModel)]="form.skill1Rating">
                <option [value]="0">Rating</option>
                <option *ngFor="let v of [1,2,3,4,5]" [value]="v">{{ v }}</option>
              </select>
            </div>
            <div class="skill-row">
              <input [(ngModel)]="form.skill2Topic" placeholder="Topic / Skill 2" style="flex:1;" />
              <select [(ngModel)]="form.skill2Rating">
                <option [value]="0">Rating</option>
                <option *ngFor="let v of [1,2,3,4,5]" [value]="v">{{ v }}</option>
              </select>
            </div>
            <div class="skill-row">
              <input [(ngModel)]="form.skill3Topic" placeholder="Topic / Skill 3" style="flex:1;" />
              <select [(ngModel)]="form.skill3Rating">
                <option [value]="0">Rating</option>
                <option *ngFor="let v of [1,2,3,4,5]" [value]="v">{{ v }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>5. Were there practical exercises that helped reinforce your learning?</label>
            <div class="radio-row">
              <label><input type="radio" name="practical" [value]="true" [(ngModel)]="form.practicalExercisesHelpful" /> Yes</label>
              <label><input type="radio" name="practical" [value]="false" [(ngModel)]="form.practicalExercisesHelpful" /> No</label>
            </div>
            <textarea *ngIf="form.practicalExercisesHelpful" rows="2" [(ngModel)]="form.practicalExercisesDetails" placeholder="Which ones were most effective?"></textarea>
          </div>
        </div>

        <div class="section">
          <h4>Section 3: Attitude / Confidence</h4>

          <div class="form-group">
            <label>6. Has your attitude or motivation towards this subject changed?</label>
            <div class="radio-row">
              <label><input type="radio" name="attitude" [value]="true" [(ngModel)]="form.attitudeChanged" /> Yes</label>
              <label><input type="radio" name="attitude" [value]="false" [(ngModel)]="form.attitudeChanged" /> No</label>
            </div>
            <textarea *ngIf="form.attitudeChanged" rows="2" [(ngModel)]="form.attitudeChangeDescription" placeholder="Describe the change..."></textarea>
          </div>

          <div class="form-group">
            <label>7. Do you feel more confident in performing tasks related to the training topic?</label>
            <div class="radio-group">
              <label *ngFor="let opt of confidenceChangeOpts; let i = index">
                <input type="radio" name="confidenceChange" [value]="i+1" [(ngModel)]="form.confidenceChange" /> {{ opt }}
              </label>
            </div>
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

      <ng-container *ngIf="readonly && data">
        <div class="readonly-view">
          <p><strong>Confidence:</strong> {{ confidenceOpts[data.confidence - 1] }}</p>
          <p><strong>Understanding before:</strong> {{ understandingOpts[data.understandingBefore - 1] }}</p>
          <p><strong>Understanding after:</strong> {{ understandingOpts[data.understandingAfter - 1] }}</p>
          <p><strong>Top things learned:</strong></p>
          <pre style="white-space:pre-wrap; font-family:inherit; margin:0 0 8px;">{{ data.topThingsLearned }}</pre>
          <p><strong>Skill improvements:</strong></p>
          <ul style="margin:0 0 8px; padding-left:20px;">
            <li>{{ data.skill1Topic || '—' }}: {{ data.skill1Rating }}/5</li>
            <li>{{ data.skill2Topic || '—' }}: {{ data.skill2Rating }}/5</li>
            <li>{{ data.skill3Topic || '—' }}: {{ data.skill3Rating }}/5</li>
          </ul>
          <p><strong>Practical exercises helpful:</strong> {{ data.practicalExercisesHelpful ? 'Yes' : 'No' }} {{ data.practicalExercisesDetails ? '— ' + data.practicalExercisesDetails : '' }}</p>
          <p><strong>Attitude changed:</strong> {{ data.attitudeChanged ? 'Yes' : 'No' }} {{ data.attitudeChangeDescription ? '— ' + data.attitudeChangeDescription : '' }}</p>
          <p><strong>Confidence change:</strong> {{ confidenceChangeOpts[data.confidenceChange - 1] }}</p>
          <div *ngIf="assessment?.status === 'REVIEWED'" style="margin-top:12px; padding:10px; background:#dbeafe; border-radius:6px;">
            <strong>HR Comments:</strong> {{ assessment?.hrComments }}
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .assessment-form { padding: 0; }
    .form-header { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #06b6d4; }
    .form-header h3 { margin: 0; }
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
    .sub-label { font-size: .82rem; font-weight: 600; color: #6b7280; }
    .skill-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
    .skill-row input { padding: 7px; border: 1px solid #d1d5db; border-radius: 6px; }
    .skill-row select { width: 80px; padding: 7px; border: 1px solid #d1d5db; border-radius: 6px; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .submitted-banner { background: #d1fae5; color: #065f46; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-weight: 600; }
    .readonly-view p { margin: 6px 0; font-size: .9rem; }
  `]
})
export class AssessmentLevel2Component implements OnInit {
  @Input() requestId!: number;
  @Input() assessment: TrainingAssessmentDto | null = null;
  @Input() readonly = false;
  @Output() submitted$ = new EventEmitter<TrainingAssessmentDto>();

  form: AssessmentLevel2Data = this.emptyForm();
  data: AssessmentLevel2Data | null = null;
  saving = false;
  submitted = false;
  error = '';

  confidenceOpts = ['Not at all confident', 'Slightly confident', 'Moderately confident', 'Very confident', 'Extremely confident'];
  understandingOpts = ['No understanding', 'Basic understanding', 'Moderate understanding', 'Good understanding', 'Excellent understanding'];
  confidenceChangeOpts = ['Much less confident', 'Slightly less confident', 'No change', 'Slightly more confident', 'Much more confident'];

  constructor(private service: AssessmentService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    if (this.assessment?.employeeData) {
      try { this.data = JSON.parse(this.assessment.employeeData); } catch {}
      if (!this.readonly && this.data) this.form = { ...this.emptyForm(), ...this.data };
    }
  }

  emptyForm(): AssessmentLevel2Data {
    return {
      confidence: 0, understandingBefore: 0, understandingAfter: 0,
      topThingsLearned: '',
      skill1Topic: '', skill1Rating: 0,
      skill2Topic: '', skill2Rating: 0,
      skill3Topic: '', skill3Rating: 0,
      practicalExercisesHelpful: null, practicalExercisesDetails: '',
      attitudeChanged: null, attitudeChangeDescription: '',
      confidenceChange: 0
    };
  }

  saveDraft() {
    this.saving = true;
    this.service.saveDraft(this.requestId, 2, this.form).subscribe({
      next: () => this.ngZone.run(() => { this.saving = false; this.cdr.detectChanges(); }),
      error: (e) => this.ngZone.run(() => { this.saving = false; this.error = e?.error?.message || 'Save failed'; this.cdr.detectChanges(); })
    });
  }

  onSubmit() {
    this.error = '';
    if (!this.form.confidence) { this.error = 'Please rate your confidence.'; return; }
    if (!this.form.understandingBefore || !this.form.understandingAfter) { this.error = 'Please rate your understanding before and after.'; return; }
    if (!this.form.topThingsLearned.trim()) { this.error = 'Please fill in the top things you learned.'; return; }
    if (!this.form.confidenceChange) { this.error = 'Please select your confidence change.'; return; }
    this.saving = true;
    this.service.submit(this.requestId, 2, this.form).subscribe({
      next: (res) => this.ngZone.run(() => { this.saving = false; this.submitted = true; this.submitted$.emit(res); this.cdr.detectChanges(); }),
      error: (e) => this.ngZone.run(() => { this.saving = false; this.error = e?.error?.message || 'Submit failed'; this.cdr.detectChanges(); })
    });
  }
}
