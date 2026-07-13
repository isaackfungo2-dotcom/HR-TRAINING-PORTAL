import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, DepartmentDto, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = 'http://localhost:8083/api/admin/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.API);
  }

  getById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API}/${id}`);
  }

  create(data: RegisterRequest): Observable<UserDto> {
    return this.http.post<UserDto>(this.API, data);
  }

  update(id: number, data: RegisterRequest): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.API}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  setActive(id: number, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/active?active=${active}`, {});
  }

  getDepartments(): Observable<DepartmentDto[]> {
    return this.http.get<DepartmentDto[]>(`${this.API}/departments`);
  }
}

