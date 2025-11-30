import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Trainer } from '../../../shared/models/trainer.model';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = 'http://localhost:3000/trainers';

  private trainersSubject = new BehaviorSubject<Trainer[]>([]);
  trainers$ = this.trainersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTrainers();
  }

  loadTrainers() {
    this.http.get<Trainer[]>(this.apiUrl).subscribe(data => this.trainersSubject.next(data));
  }

  getTrainer(id: number): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/${id}`);
  }

  addTrainer(trainer: { name: string; specialty: string }): Observable<Trainer> {
    return this.http.post<Trainer>(this.apiUrl, trainer).pipe(
      tap(() => this.loadTrainers())
    );
  }

  updateTrainer(id: number, trainer: { name: string; specialty: string }): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/${id}`, trainer).pipe(
      tap(() => this.loadTrainers())
    );
  }

  deleteTrainer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTrainers())
    );
  }
}
