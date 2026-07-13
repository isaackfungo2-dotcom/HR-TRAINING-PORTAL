import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainingAssessmentDto } from '../models';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly API = 'http://localhost:8083/api/assessments';

  constructor(private http: HttpClient) {}

  getForRequest(requestId: number): Observable<TrainingAssessmentDto[]> {
    return this.http.get<TrainingAssessmentDto[]>(`${this.API}/request/${requestId}`);
  }

  saveDraft(requestId: number, level: number, formData: object): Observable<TrainingAssessmentDto> {
    return this.http.post<TrainingAssessmentDto>(
      `${this.API}/request/${requestId}/level/${level}/draft`,
      { formData: JSON.stringify(formData) }
    );
  }

  submit(requestId: number, level: number, formData: object): Observable<TrainingAssessmentDto> {
    return this.http.post<TrainingAssessmentDto>(
      `${this.API}/request/${requestId}/level/${level}/submit`,
      { formData: JSON.stringify(formData) }
    );
  }

  supervisorSubmit(assessmentId: number, formData: object): Observable<TrainingAssessmentDto> {
    return this.http.post<TrainingAssessmentDto>(
      `${this.API}/${assessmentId}/supervisor-submit`,
      { formData: JSON.stringify(formData) }
    );
  }

  hrReview(assessmentId: number, comments: string): Observable<TrainingAssessmentDto> {
    return this.http.post<TrainingAssessmentDto>(
      `${this.API}/${assessmentId}/hr-review`,
      { comments }
    );
  }
}
