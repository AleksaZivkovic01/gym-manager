import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerService } from '../../../features/trainers/services/trainer.service';
import { RatingService } from '../../../features/ratings/services/rating.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Trainer } from '../../../shared/models/trainer.model';
import { Rating } from '../../../shared/models/rating.model';
import { User } from '../../../shared/models/user.model';
import { RatingModalComponent } from '../rating-modal/rating-modal.component';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
  selector: 'app-trainers-list',
  standalone: true,
  imports: [CommonModule, RatingModalComponent],
  templateUrl: './trainers-list.component.html',
  styleUrls: ['./trainers-list.component.scss'],
})
export class TrainersListComponent implements OnInit, OnDestroy {
  trainers: Trainer[] = [];
  trainerRatings: Map<number, number> = new Map(); // trainerId -> averageRating
  myRatings: Map<number, Rating> = new Map(); // trainerId -> Rating
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;
  showRatingModal = false;
  selectedTrainer: Trainer | null = null;
  selectedTrainerRating: Rating | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private trainerService: TrainerService,
    private ratingService: RatingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.loadTrainers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTrainers() {
    this.loading = true;
    this.error = null;
    this.trainerService.getTrainers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trainers) => {
          this.trainers = trainers;
          this.loadRatings();
        },
        error: (err) => {
          this.error = err.error?.message || 'Greška pri učitavanju trenera';
          this.loading = false;
        },
      });
  }

  loadRatings() {
    if (this.trainers.length === 0) {
      this.loading = false;
      return;
    }

    // Load average ratings for all trainers
    const ratingRequests = this.trainers.map(trainer =>
      this.ratingService.getAverageRating(trainer.id).pipe(
        takeUntil(this.destroy$)
      )
    );

    forkJoin(ratingRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ratings) => {
          ratings.forEach((rating, index) => {
            this.trainerRatings.set(this.trainers[index].id, rating);
            this.trainers[index].averageRating = rating;
          });
          
          // Load my ratings if user is a member
          if (this.currentUser?.role === 'member') {
            this.loadMyRatings();
          } else {
            this.loading = false;
          }
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  loadMyRatings() {
    if (!this.currentUser || this.currentUser.role !== 'member') {
      this.loading = false;
      return;
    }

    const myRatingRequests = this.trainers.map(trainer =>
      this.ratingService.getMyRating(trainer.id).pipe(
        takeUntil(this.destroy$)
      )
    );

    forkJoin(myRatingRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ratings) => {
          ratings.forEach((rating, index) => {
            if (rating) {
              this.myRatings.set(this.trainers[index].id, rating);
            }
          });
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  getAverageRating(trainerId: number): number {
    return this.trainerRatings.get(trainerId) || 0;
  }

  hasRated(trainerId: number): boolean {
    return this.myRatings.has(trainerId);
  }

  getMyRating(trainerId: number): Rating | undefined {
    return this.myRatings.get(trainerId);
  }

  canRate(): boolean {
    return this.currentUser?.role === 'member' && !!this.currentUser?.member?.id;
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) {
      stars += '½';
    }
    return stars || 'Nema ocena';
  }

  rateTrainer(trainerId: number) {
    const trainer = this.trainers.find(t => t.id === trainerId);
    if (!trainer) return;

    this.selectedTrainer = trainer;
    this.selectedTrainerRating = this.getMyRating(trainerId) || null;
    this.showRatingModal = true;
  }

  closeRatingModal() {
    this.showRatingModal = false;
    this.selectedTrainer = null;
    this.selectedTrainerRating = null;
  }

  submitRating(data: { rating: number; comment?: string }) {
    if (!this.selectedTrainer || !this.currentUser?.member?.id) return;

    const trainerId = this.selectedTrainer.id;
    const existingRating = this.getMyRating(trainerId);

    if (existingRating) {
      // Update existing rating
      this.ratingService.updateRating(trainerId, existingRating.id, {
        rating: data.rating,
        comment: data.comment
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedRating) => {
            this.myRatings.set(trainerId, updatedRating);
            this.loadRatings(); // Reload to update average
            this.closeRatingModal();
          },
          error: (err) => {
            alert(err.error?.message || 'Greška pri ažuriranju ocene');
          }
        });
    } else {
      // Create new rating
      this.ratingService.createRating(trainerId, {
        rating: data.rating,
        comment: data.comment,
        memberId: this.currentUser.member.id
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newRating) => {
            this.myRatings.set(trainerId, newRating);
            this.loadRatings(); // Reload to update average
            this.closeRatingModal();
          },
          error: (err) => {
            alert(err.error?.message || 'Greška pri dodavanju ocene');
          }
        });
    }
  }
}

