import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
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
    
    // For now, we'll need to find trainer by user email or ID
    this.trainerService.getTrainers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainers => {
        // Find trainer associated with current user
        // This is a temporary solution - ideally backend should provide /trainers/me endpoint
        this.trainerInfo = trainers.find(t => t.id === this.currentUser?.id) || null;
      });
  }

  loadSessions() {
    this.loading = true;
    this.sessionService.getSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.allSessions = sessions;
          this.filterSessions();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  filterSessions() {
    if (!this.currentUser || !this.trainerInfo) {
      this.upcomingSessions = [];
      this.myMembers = [];
      this.totalSessions = 0;
      return;
    }

    // Filter sessions for this trainer
    const trainerSessions = this.allSessions.filter(
      session => session.trainer?.id === this.trainerInfo?.id
    );

    this.totalSessions = trainerSessions.length;

    const now = new Date();
    
    // Get upcoming sessions
    this.upcomingSessions = trainerSessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10);

    // Get unique members from registrations
    const memberMap = new Map<number, Member>();
    trainerSessions.forEach(session => {
      if (session.registrations) {
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
    return date.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'beginner': 'Početnik',
      'medium': 'Srednji',
      'expert': 'Napredni'
    };
    return labels[level] || level;
  }
}


