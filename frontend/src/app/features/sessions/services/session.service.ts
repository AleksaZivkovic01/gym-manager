import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TrainingSession } from '../../../shared/models/training-session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = 'http://localhost:3000/sessions';

  constructor(private http: HttpClient) {}

  getSessions(): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(this.apiUrl);
  }

  getSession(id: number): Observable<TrainingSession> {
    return this.http.get<TrainingSession>(`${this.apiUrl}/${id}`);
  }

  addSession(session: TrainingSession) {
    return this.http.post<TrainingSession>(this.apiUrl, {
      date: session.date,
      time: session.time,
      type: session.type,
      memberId: session.member.id,
      trainerId: session.trainer.id
    });
  }

  updateSession(id: number, session: TrainingSession) {
    return this.http.put<TrainingSession>(`${this.apiUrl}/${id}`, {
      date: session.date,
      time: session.time,
      type: session.type,
      memberId: session.member.id,
      trainerId: session.trainer.id
    });
  }


  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
