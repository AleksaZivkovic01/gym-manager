import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TrainingSession } from '../../../shared/models/training-session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private apiUrl = 'http://localhost:3000/sessions';

  private sessionsSubject = new BehaviorSubject<TrainingSession[]>([]);
  sessions$ = this.sessionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSessions();
  }

  loadSessions() {
    this.http.get<TrainingSession[]>(this.apiUrl).subscribe(data => {
      this.sessionsSubject.next(data);
    });
  }

  getSession(id: number): Observable<TrainingSession> {
    return this.http.get<TrainingSession>(`${this.apiUrl}/${id}`);
  }

  addSession(session: TrainingSession): Observable<TrainingSession> {
    const payload = {
      date: session.date,
      time: session.time,
      type: session.type,
      memberId: session.member.id,
      trainerId: session.trainer.id
    };

    return this.http.post<TrainingSession>(this.apiUrl, payload)
      .pipe(tap(() => this.loadSessions()));
  }

  updateSession(id: number, session: TrainingSession): Observable<TrainingSession> {
    const payload = {
      date: session.date,
      time: session.time,
      type: session.type,
      memberId: session.member.id,
      trainerId: session.trainer.id
    };

    return this.http.put<TrainingSession>(`${this.apiUrl}/${id}`, payload)
      .pipe(tap(() => this.loadSessions()));
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadSessions())
    );
  }
}
