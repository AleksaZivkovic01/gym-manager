import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../features/sessions/services/session.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MemberService } from '../../../features/members/services/member.service';
import { TrainingSession } from '../../../shared/models/training-session.model';
import { User } from '../../../shared/models/user.model';
import { Member } from '../../../shared/models/member.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-available-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './available-sessions.component.html',
  styleUrls: ['./available-sessions.component.scss'],
})
export class AvailableSessionsComponent implements OnInit, OnDestroy {
  allSessions: TrainingSession[] = [];
  mySessions: TrainingSession[] = [];
  currentUser: User | null = null;
  memberInfo: Member | null = null;
  loading = true;
  error: string | null = null;
  filterTrainer: string = '';
  filterSessionType: string = '';
  trainers: { id: number; name: string }[] = [];
  sessionTypes: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private memberService: MemberService
  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user && user.role === 'member') {
          this.loadMemberData();
        } else {
          this.memberInfo = null;
          this.loadData();
        }
      });
  }

  loadMemberData() {
    if (!this.currentUser || this.currentUser.role !== 'member') {
      this.memberInfo = null;
      this.loadData();
      return;
    }

    // Load fresh member data to get updated isActive status
    this.memberService.getMyMember()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.memberInfo = member;
          // Load data after member info is loaded
          this.loadData();
        },
        error: (err) => {
          // Fallback to user.member if getMyMember fails
          this.memberInfo = this.currentUser?.member || null;
          this.loadData();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    // Load all sessions
    this.sessionService.getSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.allSessions = sessions;
          this.extractTrainers();
          
          // Load my sessions if member is logged in
          if (this.memberInfo) {
            this.sessionService.getMySessions()
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (mySessions) => {
                  this.mySessions = mySessions;
                  this.loading = false;
                },
                error: () => {
                  this.mySessions = [];
                  this.loading = false;
                }
              });
          } else {
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Greška pri učitavanju treninga';
          this.loading = false;
        }
      });
  }

  extractTrainers() {
    const trainerMap = new Map<number, { id: number; name: string }>();
    const typeSet = new Set<string>();
    
    this.allSessions.forEach(session => {
      if (session.trainer && !trainerMap.has(session.trainer.id)) {
        trainerMap.set(session.trainer.id, {
          id: session.trainer.id,
          name: session.trainer.name
        });
      }
      if (session.type) {
        typeSet.add(session.type);
      }
    });
    
    this.trainers = Array.from(trainerMap.values());
    this.sessionTypes = Array.from(typeSet).sort();
  }

  get filteredSessions(): TrainingSession[] {
    let filtered = [...this.allSessions];

    // Filter by trainer
    if (this.filterTrainer) {
      const trainerId = parseInt(this.filterTrainer, 10);
      filtered = filtered.filter(s => s.trainer?.id === trainerId);
    }

    // Filter by session type
    if (this.filterSessionType) {
      filtered = filtered.filter(s => s.type === this.filterSessionType);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }

  isRegistered(sessionId: number): boolean {
    return this.mySessions.some(s => s.id === sessionId);
  }

  canRegister(session: TrainingSession): boolean {
    if (!this.memberInfo) return false;
    if (!this.memberInfo.isActive) return false; // Member must be active (have a package)
    if (this.isRegistered(session.id)) return false;

    const registeredCount = session.registrations?.length || 0;
    return registeredCount < session.maxParticipants;
  }

  isFull(session: TrainingSession): boolean {
    const registeredCount = session.registrations?.length || 0;
    return registeredCount >= session.maxParticipants;
  }

  registerToSession(session: TrainingSession) {
    if (!this.memberInfo || !this.canRegister(session)) {
      return;
    }

    if (confirm(`Da li želite da se prijavite na trening "${session.type}" sa trenerom ${session.trainer?.name}?`)) {
      this.sessionService.registerToSession(session.id, this.memberInfo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Uspešno ste se prijavili na trening!');
            this.loadData(); // Reload to update status
          },
          error: (err) => {
            alert(err.error?.message || 'Greška pri prijavljivanju na trening');
          }
        });
    }
  }

  unregisterFromSession(session: TrainingSession) {
    if (!this.memberInfo || !this.isRegistered(session.id)) {
      return;
    }

    if (confirm(`Da li želite da se odjavite sa treninga "${session.type}"?`)) {
      this.sessionService.unregisterFromSession(session.id, this.memberInfo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Uspešno ste se odjavili sa treninga!');
            this.loadData(); // Reload to update status
          },
          error: (err) => {
            alert(err.error?.message || 'Greška pri odjavljivanju sa treninga');
          }
        });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusText(session: TrainingSession): string {
    if (this.isRegistered(session.id)) {
      return 'Prijavljen';
    }
    if (this.isFull(session)) {
      return 'Popunjeno';
    }
    const registeredCount = session.registrations?.length || 0;
    return `${registeredCount}/${session.maxParticipants} prijavljeno`;
  }

  getStatusClass(session: TrainingSession): string {
    if (this.isRegistered(session.id)) {
      return 'status-registered';
    }
    if (this.isFull(session)) {
      return 'status-full';
    }
    return 'status-available';
  }
}

