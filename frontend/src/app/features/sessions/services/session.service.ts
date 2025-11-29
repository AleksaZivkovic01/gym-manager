import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainingSession } from '../../../shared/models/training-session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private apiUrl = 'http://localhost:3000/sessions';

  constructor(private http: HttpClient) {}

  getSessions(): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(this.apiUrl);
  }

  getSession(id: number): Observable<TrainingSession> {
    return this.http.get<TrainingSession>(`${this.apiUrl}/${id}`);
  }

  addSession(session: TrainingSession): Observable<TrainingSession> {
    return this.http.post<TrainingSession>(this.apiUrl, session);
  }

  updateSession(id: number, session: TrainingSession): Observable<TrainingSession> {
    return this.http.put<TrainingSession>(`${this.apiUrl}/${id}`, session);
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
