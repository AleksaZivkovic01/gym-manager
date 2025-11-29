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

  getTrainers(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(this.apiUrl);
  }

  getTrainer(id: number): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/${id}`);
  }

  addTrainer(trainer: Trainer): Observable<Trainer> {
    return this.http.post<Trainer>(this.apiUrl, trainer);
  }

  updateTrainer(id: number, trainer: Trainer): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/${id}`, trainer);
  }

  deleteTrainer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
