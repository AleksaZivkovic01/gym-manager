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
import { Activity } from '../../../shared/models/activity.model';
import { Subject, takeUntil, forkJoin, combineLatest } from 'rxjs';

// pomocni interfejs za prikaz statistike
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
  pendingPackagesCount = 0;
  recentSessions: TrainingSession[] = [];
  recentActivities: Activity[] = [];
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
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    
    combineLatest({
      members: this.memberService.getMembers(),
      trainers: this.trainerService.getTrainers(),
      pendingUsers: this.userService.getPendingUsers(),
      sessions: this.sessionService.getSessions()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ members, trainers, pendingUsers, sessions }) => {
          // podaci o memberima
          this.totalMembers = members.length;
          this.activeMembers = members.filter(m => m.isActive).length;
          this.calculateMembersSummary(members);

          // podaci o trenerima
          this.totalTrainers = trainers.length;

          // podaci o pending users
          this.pendingUsersCount = pendingUsers.length;

          // podaci o pending packages
          const pendingPackages = members.filter(m => m.packageStatus === 'pending_package');
          this.pendingPackagesCount = pendingPackages.length;

          // podaci o sesijama
          this.totalSessions = sessions.length;
          this.calculateUpcomingSessions(sessions);
          this.loadRecentSessions(sessions);

          this.loadRecentActivities();
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  loadRecentActivities() {
    forkJoin({
      users: this.userService.getAllUsers(),
      sessions: this.sessionService.getSessions()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ users, sessions }) => {
          const activities: Activity[] = [];

          // dodaj nove korisnike (poslednjih 7 dana)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          users.forEach(user => {
            if (user.createdAt && user.status === 'approved') {
              const createdAt = new Date(user.createdAt);
              if (createdAt >= sevenDaysAgo) {
                activities.push({
                  id: `user-${user.id}`,
                  type: 'user_registered',
                  timestamp: user.createdAt,
                  data: {
                    userName: user.member?.name || user.trainer?.name || user.email,
                    userRole: user.role as 'member' | 'trainer'
                  }
                });
              }
            }
          });

          // dodaj nove sesije (poslednjih 7 dana)
          sessions.forEach(session => {
            if (session.createdAt) {
              const createdAt = new Date(session.createdAt);
              if (createdAt >= sevenDaysAgo) {
                activities.push({
                  id: `session-${session.id}`,
                  type: 'session_created',
                  timestamp: session.createdAt,
                  data: {
                    sessionType: session.type,
                    sessionDate: session.date,
                    sessionTime: session.time,
                    trainerName: session.trainer?.name
                  }
                });
              }
            }
          });

          // sort (poslednjih 8 aktivnosti)
          this.recentActivities = activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 8);

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
    return date.toLocaleDateString('EN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}


