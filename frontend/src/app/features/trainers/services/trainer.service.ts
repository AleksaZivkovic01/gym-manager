import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trainer } from '../../../shared/models/trainer.model';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = 'http://localhost:3000/trainers';

  constructor(private http: HttpClient) {}

  // GET ALL
  getTrainers(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(this.apiUrl);
  }

  // GET BY ID
  getTrainer(id: number): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/${id}`);
  }

  // ADD
  addTrainer(trainer: Trainer): Observable<Trainer> {
    return this.http.post<Trainer>(this.apiUrl, trainer);
  }

  // UPDATE
  updateTrainer(id: number, trainer: Trainer): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/${id}`, trainer);
  }

  // DELETE
  deleteTrainer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET CURRENT TRAINER
  getMyTrainer(): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/me`);
  }

  // UPDATE CURRENT TRAINER
  updateMyTrainer(trainer: Partial<Trainer>): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/me`, trainer);
  }
}
