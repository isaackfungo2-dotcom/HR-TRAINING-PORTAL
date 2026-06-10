import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardMetricsDto } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = 'http://localhost:8083/api/dashboard';

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<DashboardMetricsDto> {
    return this.http.get<DashboardMetricsDto>(`${this.API}/metrics`);
  }

  getByDepartment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/by-department`);
  }

  getMonthlyTrend(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/monthly-trend`);
  }

  getTypeDistribution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/type-distribution`);
  }

  getApprovalRates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/approval-rates`);
  }
}
