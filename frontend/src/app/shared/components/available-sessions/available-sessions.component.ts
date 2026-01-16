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

    this.memberService.getMyMember()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.memberInfo = member;
          this.loadData();
        },
        error: (err) => {
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

    this.sessionService.getSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.allSessions = sessions;
          this.extractTrainers();
          
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
          this.error = err.error?.message || 'Error with loading sessions.';
          this.loading = false;
        }
      });
  }

  extractTrainers() {
    const trainerMap = new Map<number, { id: number; name: string }>(); // treneri za dropdown,nema duplikata
    const typeSet = new Set<string>(); // tip treninga za dropdown
    
    // bolje map i set od niza,jer map omogucava brzu proveru sa has i sprecavaju diplikate 
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
    
    this.trainers = Array.from(trainerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    this.sessionTypes = Array.from(typeSet).sort();
  }

  get filteredSessions(): TrainingSession[] {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    let filtered = this.allSessions.filter(session => {
      const sessionDateStr = session.date.split('T')[0];
      const sessionTime = session.time.substring(0, 5);
      
      if (sessionDateStr > today) {
        return true;
      } else if (sessionDateStr === today) {
        return sessionTime > currentTime;
      }
      return false; 
    });

    
    if (this.filterTrainer) {
      const trainerId = parseInt(this.filterTrainer, 10);
      filtered = filtered.filter(s => s.trainer?.id === trainerId);
    }

    
    if (this.filterSessionType) {
      filtered = filtered.filter(s => s.type === this.filterSessionType);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      // sort po vremenu ako je isti datum 
      return a.time.localeCompare(b.time);
    });

    return filtered;
  }

  isRegistered(sessionId: number): boolean {
    return this.mySessions.some(s => s.id === sessionId);
  }

  canRegister(session: TrainingSession): boolean {
    if (!this.memberInfo) return false;
    if (!this.memberInfo.isActive) return false;
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

    if (confirm(`Do you want to register for training"${session.type}" with trainer ${session.trainer?.name}?`)) {
      this.sessionService.registerToSession(session.id, this.memberInfo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Successfully registered for the session!');
            this.loadData(); 
          },
          error: (err) => {
            alert(err.error?.message || 'Error registering for training');
          }
        });
    }
  }

  unregisterFromSession(session: TrainingSession) {
    if (!this.memberInfo || !this.isRegistered(session.id)) {
      return;
    }

    if (confirm(`Do you want to unregister from training "${session.type}"?`)) {
      this.sessionService.unregisterFromSession(session.id, this.memberInfo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Successfully unregistered from the session!');
            this.loadData(); 
          },
          error: (err) => {
            alert(err.error?.message || 'Error unregistering from training');
          }
        });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-EN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusText(session: TrainingSession): string {
    if (this.isRegistered(session.id)) {
      return 'Enrolled';
    }
    if (this.isFull(session)) {
      return 'Full';
    }
    const registeredCount = session.registrations?.length || 0;
    return `${registeredCount}/${session.maxParticipants} Enrolled`;
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

