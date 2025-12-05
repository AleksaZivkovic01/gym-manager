import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionService } from '../../../features/sessions/services/session.service';
import { MemberService } from '../../../features/members/services/member.service';
import { TrainerService } from '../../../features/trainers/services/trainer.service';
import { UserService } from '../../../features/users/services/user.service';
import { User } from '../../../shared/models/user.model';
import { TrainingSession } from '../../../shared/models/training-session.model';
import { Member } from '../../../shared/models/member.model';
import { Trainer } from '../../../shared/models/trainer.model';
import { Subject, takeUntil } from 'rxjs';

interface MembersSummary {
  active: number;
  inactive: number;
  byLevel: {
    beginner: number;
    medium: number;
    expert: number;
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  totalMembers = 0;
  activeMembers = 0;
  totalTrainers = 0;
  totalSessions = 0;
  upcomingSessionsCount = 0;
  pendingUsersCount = 0;
  recentSessions: TrainingSession[] = [];
  membersSummary: MembersSummary | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private memberService: MemberService,
    private trainerService: TrainerService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Load all data
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    
    // Load members
    this.memberService.getMembers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        this.totalMembers = members.length;
        this.activeMembers = members.filter(m => m.isActive).length;
        this.calculateMembersSummary(members);
      });

    // Load trainers
    this.trainerService.getTrainers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainers => {
        this.totalTrainers = trainers.length;
      });

    // Load pending users
    this.userService.getPendingUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.pendingUsersCount = users.length;
        },
        error: () => {
          // Ignore errors for pending users count
        }
      });

    // Load sessions
    this.sessionService.getSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.totalSessions = sessions.length;
          this.calculateUpcomingSessions(sessions);
          this.loadRecentSessions(sessions);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  calculateMembersSummary(members: Member[]) {
    const summary: MembersSummary = {
      active: 0,
      inactive: 0,
      byLevel: {
        beginner: 0,
        medium: 0,
        expert: 0
      }
    };

    members.forEach(member => {
      if (member.isActive) {
        summary.active++;
      } else {
        summary.inactive++;
      }

      if (member.level === 'beginner') {
        summary.byLevel.beginner++;
      } else if (member.level === 'medium') {
        summary.byLevel.medium++;
      } else if (member.level === 'expert') {
        summary.byLevel.expert++;
      }
    });

    this.membersSummary = summary;
  }

  calculateUpcomingSessions(sessions: TrainingSession[]) {
    const now = new Date();
    this.upcomingSessionsCount = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= now;
    }).length;
  }

  loadRecentSessions(sessions: TrainingSession[]) {
    const now = new Date();
    this.recentSessions = sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate < now;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}


