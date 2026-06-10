import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainingRequestDto, ApprovalAction, TrainingDocumentDto, AuditLogDto } from '../models';

@Injectable({ providedIn: 'root' })
export class TrainingRequestService {
  private readonly API = 'http://localhost:8083/api/requests';

  constructor(private http: HttpClient) {}

  create(data: FormData): Observable<TrainingRequestDto> {
    return this.http.post<TrainingRequestDto>(this.API, data);
  }

  getMyRequests(): Observable<TrainingRequestDto[]> {
    return this.http.get<TrainingRequestDto[]>(`${this.API}/my`);
  }

  getSupervisorPending(): Observable<TrainingRequestDto[]> {
    return this.http.get<TrainingRequestDto[]>(`${this.API}/supervisor/pending`);
  }

  getAll(status?: string, departmentId?: number, keyword?: string): Observable<TrainingRequestDto[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (departmentId) params = params.set('departmentId', departmentId.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<TrainingRequestDto[]>(this.API, { params });
  }

  getById(id: number): Observable<TrainingRequestDto> {
    return this.http.get<TrainingRequestDto>(`${this.API}/${id}`);
  }

  supervisorAction(id: number, action: ApprovalAction): Observable<TrainingRequestDto> {
    return this.http.post<TrainingRequestDto>(`${this.API}/${id}/supervisor-action`, action);
  }

  hrAction(id: number, action: ApprovalAction): Observable<TrainingRequestDto> {
    return this.http.post<TrainingRequestDto>(`${this.API}/${id}/hr-action`, action);
  }

  getDocuments(id: number): Observable<TrainingDocumentDto[]> {
    return this.http.get<TrainingDocumentDto[]>(`${this.API}/${id}/documents`);
  }

  getAuditLogs(id: number): Observable<AuditLogDto[]> {
    return this.http.get<AuditLogDto[]>(`${this.API}/${id}/audit-logs`);
  }
}
