import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationDto } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = 'http://localhost:8083/api/notifications';

  constructor(private http: HttpClient) {}

  getMy(userId: number): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.API}/my?userId=${userId}`);
  }

  getUnread(userId: number): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.API}/unread?userId=${userId}`);
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.API}/unread-count?userId=${userId}`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/read`, {});
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.API}/read-all?userId=${userId}`, {});
  }
}

