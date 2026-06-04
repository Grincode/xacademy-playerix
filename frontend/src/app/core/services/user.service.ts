import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppUser {
  id: number;
  email: string;
  role: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = '/api/users';

  constructor(private http: HttpClient) {}

  findAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.API_URL);
  }

  findOne(id: number): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.API_URL}/${id}`);
  }

  create(dto: CreateUserRequest): Observable<AppUser> {
    return this.http.post<AppUser>(this.API_URL, dto);
  }

  update(id: number, dto: UpdateUserRequest): Observable<AppUser> {
    return this.http.patch<AppUser>(`${this.API_URL}/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
