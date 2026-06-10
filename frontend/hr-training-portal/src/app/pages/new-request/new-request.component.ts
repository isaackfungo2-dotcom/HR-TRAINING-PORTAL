import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainingRequestService } from '../../services/training-request.service';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-title">New Training Request</div>
    <div class="card">
      <div class="form-grid">
        <div class="form-group"><label>Title</label><input [(ngModel)]="data.title" /></div>
        <div class="form-group"><label>Training Type</label>
          <select [(ngModel)]="data.trainingType"><option value="IN_COUNTRY">In-Country</option><option value="OUT_OF_COUNTRY">Out-of-Country</option></select>
        </div>
        <div class="form-group"><label>Start Date</label><input type="date" [(ngModel)]="data.proposedStartDate" /></div>
        <div class="form-group"><label>End Date</label><input type="date" [(ngModel)]="data.proposedEndDate" /></div>
        <div class="form-group"><label>Provider</label><input [(ngModel)]="data.provider" /></div>
        <div class="form-group"><label>Institution</label><input [(ngModel)]="data.institution" /></div>
        <div class="form-group"><label>Estimated Cost</label><input type="number" [(ngModel)]="data.estimatedCost" /></div>
        <div class="form-group"><label>Currency</label>
          <select [(ngModel)]="data.currency"><option value="USD">USD</option><option value="TZS">TZS</option></select>
        </div>
        <div class="form-group full"><label>Description</label><textarea rows="3" [(ngModel)]="data.description"></textarea></div>
        <div class="form-group full"><label>Objectives</label><textarea rows="3" [(ngModel)]="data.objectives"></textarea></div>
        <div class="form-group full"><label>Justification</label><textarea rows="3" [(ngModel)]="data.justification"></textarea></div>
        <div class="form-group full"><label>Expected Benefits</label><textarea rows="3" [(ngModel)]="data.expectedBenefits"></textarea></div>
        <div class="form-group full"><label>Supporting Documents</label><input type="file" multiple (change)="onFiles($event)" /></div>
      </div>
      <div style="margin-top:12px;"><button class="btn-aqua" (click)="submit()">Submit Request</button></div>
      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:12px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label { display:block; font-size:.85rem; color:#374151; margin-bottom:4px; }
    .form-group input, .form-group select, .form-group textarea { width:100%; padding:8px; border:1px solid #d1d5db; border-radius:6px; box-sizing:border-box; }
    .error { color:#dc2626; margin-top:8px; }
  `]
})
export class NewRequestComponent {
  data = { title: '', trainingType: 'IN_COUNTRY', proposedStartDate: '', proposedEndDate: '', provider: '', institution: '', estimatedCost: 0, currency: 'USD', description: '', objectives: '', justification: '', expectedBenefits: '' };
  files: File[] = [];
  error = '';

  constructor(private service: TrainingRequestService, private router: Router) {}

  onFiles(e: any) { this.files = Array.from(e.target.files); }

  submit() {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify(this.data)], { type: 'application/json' }));
    this.files.forEach(f => form.append('files', f));
    this.service.create(form).subscribe({
      next: () => this.router.navigate(['/requests']),
      error: (err) => this.error = err.error?.message || 'Failed to submit'
    });
  }
}
