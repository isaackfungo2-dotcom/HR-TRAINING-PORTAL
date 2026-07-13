import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { TrainingRequestService } from '../../services/training-request.service';
import { DashboardMetricsDto, TrainingRequestDto } from '../../models';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-title">Dashboard</div>
    <div class="metrics-grid">
      <div class="metric-card" *ngFor="let m of metrics">
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </div>
    <div class="charts-row">
      <div class="card chart-card"><canvas id="trendChart"></canvas></div>
      <div class="card chart-card"><canvas id="deptChart"></canvas></div>
    </div>
    <div class="charts-row">
      <div class="card chart-card"><canvas id="typeChart"></canvas></div>
      <div class="card chart-card"><canvas id="approvalChart"></canvas></div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h3 style="margin:0 0 10px;">Recent Training Requests</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Title</th><th>Employee</th><th>Type</th><th>Status</th><th>Start Date</th></tr></thead>
          <tbody>
            <tr *ngFor="let r of recentRequests"><td>{{ r.id }}</td><td>{{ r.title }}</td><td>{{ r.employeeName }}</td><td>{{ r.trainingType }}</td><td><span class="status-badge" [ngClass]="'status-'+ (r.status | lowercase).replaceAll('_','-')">{{ r.status }}</span></td><td>{{ r.proposedStartDate }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .metrics-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:12px; margin-bottom:16px; }
    .metric-card { background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.08); padding:16px; text-align:center; border-top:3px solid var(--aqua-primary); }
    .metric-value { font-size:1.6rem; font-weight:700; color:#111827; }
    .metric-label { font-size:.85rem; color:#6b7280; margin-top:4px; }
    .charts-row { display:grid; grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); gap:12px; margin-bottom:12px; }
    .chart-card { height:260px; display:flex; align-items:center; justify-content:center; }
    @media (max-width: 768px) {
      .charts-row { grid-template-columns: 1fr; }
      .chart-card { height:220px; }
      .metric-value { font-size:1.3rem; }
    }
    @media (max-width: 480px) {
      .chart-card { height:190px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  metrics: { label: string; value: any }[] = [];
  recentRequests: TrainingRequestDto[] = [];

  constructor(
    private dashboardService: DashboardService,
    private requestService: TrainingRequestService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.dashboardService.getMetrics().subscribe({
      next: m => this.ngZone.run(() => {
        this.metrics = [
          { label: 'Total (Month)', value: m.totalRequestsThisMonth },
          { label: 'Pending Supervisor', value: m.pendingSupervisor },
          { label: 'Pending HR', value: m.pendingHr },
          { label: 'Approved In-Country', value: m.approvedInCountry },
          { label: 'Approved Out-of-Country', value: m.approvedOutOfCountry },
          { label: 'Rejected', value: m.rejected },
          { label: 'Upcoming 30d', value: m.upcoming30Days },
          { label: 'Upcoming 60d', value: m.upcoming60Days },
          { label: 'Est. Cost (Month)', value: this.formatCost(m.totalEstimatedCostThisMonth, m.currency) },
        ];
        this.cdr.detectChanges();
      }),
      error: () => {}
    });
    this.requestService.getAll().subscribe({
      next: list => this.ngZone.run(() => { this.recentRequests = list.slice(0, 10); this.cdr.detectChanges(); }),
      error: () => {}
    });
    this.dashboardService.getMonthlyTrend().subscribe({ next: data => this.ngZone.run(() => this.renderTrend(data)), error: () => {} });
    this.dashboardService.getByDepartment().subscribe({ next: data => this.ngZone.run(() => this.renderDept(data)), error: () => {} });
    this.dashboardService.getTypeDistribution().subscribe({ next: data => this.ngZone.run(() => this.renderType(data)), error: () => {} });
    this.dashboardService.getApprovalRates().subscribe({ next: data => this.ngZone.run(() => this.renderApproval(data)), error: () => {} });
  }

  renderTrend(data: any[]) {
    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    new Chart(ctx, { type: 'line', data: { labels: data.map(d => d.month), datasets: [{ label: 'Requests', data: data.map(d => d.count), borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)', fill: true, tension: .3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
  renderDept(data: any[]) {
    const ctx = document.getElementById('deptChart') as HTMLCanvasElement;
    new Chart(ctx, { type: 'doughnut', data: { labels: data.map(d => d.department), datasets: [{ data: data.map(d => d.count), backgroundColor: ['#06b6d4','#0891b2','#20c997','#0ea5e9','#6366f1'] }] }, options: { responsive: true, maintainAspectRatio: false } });
  }
  renderType(data: any[]) {
    const ctx = document.getElementById('typeChart') as HTMLCanvasElement;
    new Chart(ctx, { type: 'bar', data: { labels: data.map(d => d.type), datasets: [{ label: 'Count', data: data.map(d => d.count), backgroundColor: ['#06b6d4','#111827'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  }
  renderApproval(data: any[]) {
    const ctx = document.getElementById('approvalChart') as HTMLCanvasElement;
    new Chart(ctx, { type: 'pie', data: { labels: data.map(d => d.status), datasets: [{ data: data.map(d => d.count), backgroundColor: ['#22c55e','#ef4444','#f59e0b'] }] }, options: { responsive: true, maintainAspectRatio: false } });
  }
  formatCost(amount: number, currency?: string): string {
    if (!amount) return '';
    if (currency === 'TZS') {
      return 'TZS ' + amount.toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  }
}
