import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RatingModalComponent],
  templateUrl: './trainers-list.component.html',
  styleUrls: ['./trainers-list.component.scss'],
})
export class TrainersListComponent implements OnInit, OnDestroy {
  trainers: Trainer[] = [];
  trainerRatings: Map<number, number> = new Map(); // <trainerId, averageRating>
  myRatings: Map<number, Rating> = new Map(); // <trainerId, myRating>
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;
  showRatingModal = false;
  selectedTrainer: Trainer | null = null;
  selectedTrainerRating: Rating | null = null;
  selectedSpecialty: string = '';
  specialties: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private trainerService: TrainerService,
    private ratingService: RatingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
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
          if (trainers && trainers.length > 0) {
            this.extractSpecialties();
          }
          this.loadRatings();
        },
        error: (err) => {
          this.error = err.error?.message || 'Error with loading trainers.';
          this.loading = false;
        },
      });
  }

  loadRatings() {
    if (this.trainers.length === 0) {
      this.loading = false;
      return;
    }

    // za svakog trenera pravi se jedan zahtev,niz observabla
    const ratingRequests = this.trainers.map(trainer =>
      this.ratingService.getAverageRating(trainer.id)
                        .pipe(takeUntil(this.destroy$))
    );
    // zato - forkJoin,ceka da se svi pozivi zavrse
    forkJoin(ratingRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ratings) => {
          ratings.forEach((rating, index) => {
            this.trainerRatings.set(this.trainers[index].id, rating);
            this.trainers[index].averageRating = rating;
          });
          
          
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

  extractSpecialties() {
    this.specialties = [];
    const specialtySet = new Set<string>();
    if (this.trainers && this.trainers.length > 0) {
      this.trainers.forEach(trainer => {
        if (trainer && trainer.specialty) {
          const specialty = String(trainer.specialty).trim();
          if (specialty !== '') {
            specialtySet.add(specialty);
          }
        }
      });
      this.specialties = Array.from(specialtySet).sort();
    }
  }

  get filteredTrainers(): Trainer[] {
    if (!this.selectedSpecialty) {
      return this.trainers;
    }
    return this.trainers.filter(trainer => trainer.specialty === this.selectedSpecialty);
  }

  onSpecialtyChange(specialty: string) {
    this.selectedSpecialty = specialty;
  }

  clearFilter() {
    this.selectedSpecialty = '';
  }

  getStars(rating: number): string {
    if (!rating || rating <= 0) {
      return 'No ratings';
    }

    const starsCount = Math.min(5, Math.round(rating));
    return '⭐'.repeat(starsCount);
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
      this.ratingService.updateRating(trainerId, existingRating.id, {
        rating: data.rating,
        
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedRating) => {
            this.myRatings.set(trainerId, updatedRating);
            this.loadRatings(); 
            this.closeRatingModal();
          },
          error: (err) => {
            alert(err.error?.message || 'Error with updating rating');
          }
        });
    } else {
      this.ratingService.createRating(trainerId, {
        rating: data.rating,
       
        memberId: this.currentUser.member.id
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newRating) => {
            this.myRatings.set(trainerId, newRating);
            this.loadRatings(); 
            this.closeRatingModal();
          },
          error: (err) => {
            alert(err.error?.message || 'Error with adding rating');
          }
        });
    }
  }
}

