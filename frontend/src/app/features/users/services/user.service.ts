import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/pending/approvals`);
  }

  approveUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/reject`, {});
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateMe(updateData: { email?: string; oldPassword?: string; newPassword?: string }): Observable<Omit<User, 'password'>> {
    return this.http.put<Omit<User, 'password'>>(`${this.apiUrl}/me`, updateData);
  }
}

