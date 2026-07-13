import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8083/api/auth';

  private _loggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  readonly loggedIn$ = this._loggedIn$.asObservable();

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, data);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data);
  }

  me(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API}/me`);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this._loggedIn$.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
    this._loggedIn$.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

