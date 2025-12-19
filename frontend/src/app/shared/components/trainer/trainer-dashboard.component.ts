import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionService } from '../../../features/sessions/services/session.service';
import { TrainerService } from '../../../features/trainers/services/trainer.service';
import { User } from '../../../shared/models/user.model';
import { TrainingSession } from '../../../shared/models/training-session.model';
import { Trainer } from '../../../shared/models/trainer.model';
import { Member } from '../../../shared/models/member.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trainer-dashboard.component.html',
  styleUrls: ['./trainer-dashboard.component.scss'],
})
export class TrainerDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  trainerInfo: Trainer | null = null;
  allSessions: TrainingSession[] = [];
  upcomingSessions: TrainingSession[] = [];
  myMembers: Member[] = [];
  totalSessions = 0;
  totalRegistrations = 0;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private trainerService: TrainerService
  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadTrainerData();
        }
      });

    // Load sessions
    this.loadSessions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTrainerData() {
    if (!this.currentUser) return;
    
    this.trainerService.getMyTrainer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trainer) => {
          this.trainerInfo = trainer;
          // Re-filter sessions when trainer data is loaded
          if (this.allSessions.length > 0) {
            this.filterSessions();
          }
        },
        error: (err) => {
          console.error('Error loading trainer data:', err);
          this.trainerInfo = null;
        }
      });
  }

  loadSessions() {
    this.loading = true;
    this.sessionService.getSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.allSessions = sessions;
          // Filter sessions if trainer info is already loaded
          if (this.trainerInfo) {
            this.filterSessions();
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  filterSessions() {
    if (!this.trainerInfo) {
      this.upcomingSessions = [];
      this.myMembers = [];
      this.totalSessions = 0;
      this.totalRegistrations = 0;
      return;
    }

    // Filter sessions for this trainer
    const trainerSessions = this.allSessions.filter(
      session => session.trainer?.id === this.trainerInfo?.id
    );

    this.totalSessions = trainerSessions.length;

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    
    // Get upcoming sessions (uzimajući u obzir i datum i vreme)
    this.upcomingSessions = trainerSessions
      .filter(session => {
        const sessionDateStr = session.date.split('T')[0]; // YYYY-MM-DD format
        const sessionTime = session.time.substring(0, 5); // HH:MM format
        
        // Proveri da li je termin u budućnosti
        if (sessionDateStr > today) {
          return true; // Termin je u budućnosti
        } else if (sessionDateStr === today) {
          return sessionTime > currentTime; // Termin je danas, proveri da li je vreme u budućnosti
        }
        return false; // Termin je prošao
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        // Ako su isti datum, sortiraj po vremenu
        return a.time.localeCompare(b.time);
      });

    // Calculate total registrations
    this.totalRegistrations = trainerSessions.reduce((total, session) => {
      return total + (session.registrations?.length || 0);
    }, 0);

    // Get unique members from registrations
    const memberMap = new Map<number, Member>();
    trainerSessions.forEach(session => {
      if (session.registrations && session.registrations.length > 0) {
        session.registrations.forEach(registration => {
          if (registration.member && !memberMap.has(registration.member.id)) {
            memberMap.set(registration.member.id, registration.member);
          }
        });
      }
    });
    this.myMembers = Array.from(memberMap.values());
  }

  getMemberSessionCount(memberId: number): number {
    return this.allSessions.filter(
      session => session.trainer?.id === this.trainerInfo?.id && 
                 session.registrations?.some(reg => reg.member?.id === memberId)
    ).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('EN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  formatTime(timeString: string): string {
    return timeString.substring(0, 5); // da bi se prikazalo samo casovi i minuti bez sekundi,prva 5 karaktera
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'beginner': 'Beginner',
      'medium': 'Medium',
      'expert': 'Expert' 
    };
    return labels[level] || level;
  }

  getDisplayName(): string {
    if (this.trainerInfo?.name) {
      return this.trainerInfo.name;
    }
    if (this.currentUser?.email) {
      return this.currentUser.email;
    }
    return 'Trener';
  }

  getRatingStars(rating?: number): string {
    if (!rating) return '';
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }
}


