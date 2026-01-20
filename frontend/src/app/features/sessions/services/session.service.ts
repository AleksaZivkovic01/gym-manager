import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainingSession } from '../../../shared/models/training-session.model';
import { Member } from '../../../shared/models/member.model';

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

  getSessionsByTrainer(trainerId: number): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(`${this.apiUrl}/trainer/${trainerId}`);
  }

  getMySessions(): Observable<TrainingSession[]> {
    return this.http.get<TrainingSession[]>(`${this.apiUrl}/my-sessions`);
  }

  getRegisteredMembers(sessionId: number): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/${sessionId}/members`);
  }

  addSession(session: Partial<TrainingSession>) {
    return this.http.post<TrainingSession>(this.apiUrl, {
      date: session.date,
      time: session.time,
      type: session.type,
      trainerId: session.trainer?.id,
      maxParticipants: session.maxParticipants || 10
    });
  }

  createMySession(session: { date: string; time: string; type: string; maxParticipants: number }): Observable<TrainingSession> {
    return this.http.post<TrainingSession>(`${this.apiUrl}/me`, session);
  }

  updateSession(id: number, session: Partial<TrainingSession>) {
    return this.http.put<TrainingSession>(`${this.apiUrl}/${id}`, {
      date: session.date,
      time: session.time,
      type: session.type,
      trainerId: session.trainer?.id,
      maxParticipants: session.maxParticipants
    });
  }

  registerToSession(sessionId: number, memberId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/register`, { memberId });
  }

  unregisterFromSession(sessionId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sessionId}/register/${memberId}`);
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  checkSessionAvailability(sessionId: number): Promise<{ available: boolean; spotsLeft: number }> {
    const token = localStorage.getItem('gym_manager_token');
    
    return fetch(`${this.apiUrl}/${sessionId}/availability`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json() as Promise<{ available: boolean; spotsLeft: number }>;
      })
      .catch((error) => {
        console.error('Error checking session availability:', error);
        throw error;
      });
  }
}
