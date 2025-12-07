import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../../../shared/models/rating.model';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private apiUrl = 'http://localhost:3000/trainers';

  constructor(private http: HttpClient) {}

  getRatings(trainerId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/${trainerId}/ratings`);
  }

  getAverageRating(trainerId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${trainerId}/ratings/average`);
  }

  getMyRating(trainerId: number): Observable<Rating | null> {
    return this.http.get<Rating | null>(`${this.apiUrl}/${trainerId}/ratings/my-rating`);
  }

  createRating(trainerId: number, rating: { rating: number; comment?: string; memberId: number }): Observable<Rating> {
    return this.http.post<Rating>(`${this.apiUrl}/${trainerId}/ratings`, rating);
  }

  updateRating(trainerId: number, ratingId: number, rating: { rating?: number; comment?: string }): Observable<Rating> {
    return this.http.put<Rating>(`${this.apiUrl}/${trainerId}/ratings/${ratingId}`, rating);
  }

  deleteRating(trainerId: number, ratingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${trainerId}/ratings/${ratingId}`);
  }
}

