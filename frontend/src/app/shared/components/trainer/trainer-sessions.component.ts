import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
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
  selector: 'app-trainer-sessions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './trainer-sessions.component.html',
  styleUrls: ['./trainer-sessions.component.scss'],
})
export class TrainerSessionsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  trainerInfo: Trainer | null = null;
  sessions: TrainingSession[] = [];
  allSessions: TrainingSession[] = []; 
  loading = true;
  showSessionForm = false;
  isSubmittingSession = false;
  sessionErrorMessage = '';
  sessionSuccessMessage = '';
  editingSessionId: number | null = null;
  showMembersForSession: { [sessionId: number]: boolean } = {};
  sessionMembers: { [sessionId: number]: Member[] } = {};
  loadingMembers: { [sessionId: number]: boolean } = {};
  selectedFilter: 'upcoming' | 'past' | 'all' = 'upcoming'; 
  private destroy$ = new Subject<void>();
  
  sessionForm: FormGroup<{
    date: FormControl<string>;
    time: FormControl<string>;
    type: FormControl<string>;
    maxParticipants: FormControl<number>;
  }>;

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private trainerService: TrainerService,
    private fb: FormBuilder
  ) {
    this.sessionForm = this.fb.nonNullable.group({
      date: ['', [Validators.required]],
      time: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
      type: ['', [Validators.required]],
      maxParticipants: [10, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadTrainerData();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDisplayName(): string {
    if (this.trainerInfo?.name) {
      return this.trainerInfo.name;
    }
    return 'Trainer';
  }

  loadTrainerData() {
    if (!this.currentUser) return;

    this.trainerService.getMyTrainer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trainer) => {
          this.trainerInfo = trainer;
          this.loadSessions();
        },
        error: (err) => {
          console.error('Error loading trainer data:', err);
          this.trainerInfo = null;
          this.loading = false; 
        }
      });
  }

  loadSessions() {
    if (!this.trainerInfo) return;

    this.loading = true;
    this.sessionService.getSessionsByTrainer(this.trainerInfo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.allSessions = sessions.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA.getTime() - dateB.getTime();
          });
          this.applyFilter();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading sessions:', err);
          this.loading = false;
        }
      });
  }

  applyFilter() {
    const now = new Date();
    
    switch (this.selectedFilter) {
      case 'upcoming':
        this.sessions = this.allSessions.filter(session => {
          const sessionDate = new Date(session.date + 'T' + session.time);
          return sessionDate >= now;
        });
        break;
      case 'past':
        this.sessions = this.allSessions.filter(session => {
          const sessionDate = new Date(session.date + 'T' + session.time);
          return sessionDate < now;
        });
        break;
      case 'all':
        this.sessions = [...this.allSessions];
        break;
    }
  }

  setFilter(filter: 'upcoming' | 'past' | 'all') {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5);
  }

  toggleSessionForm() {
    this.showSessionForm = !this.showSessionForm;
    if (!this.showSessionForm) {
      this.sessionForm.reset();
      this.sessionForm.enable();
      this.sessionErrorMessage = '';
      this.sessionSuccessMessage = '';
      this.editingSessionId = null;
    }
  }

  editSession(session: TrainingSession) {
    this.editingSessionId = session.id;

    const sessionDate = new Date(session.date);
    const formattedDate = sessionDate.toISOString().split('T')[0];

    this.sessionForm.patchValue({
      date: formattedDate,
      time: session.time,
      type: session.type,
      maxParticipants: session.maxParticipants
    });

    if (this.isPastSession(session)) {
      this.sessionForm.disable(); 
    } else {
      this.sessionForm.enable();
    }
    
    this.showSessionForm = true;
    this.sessionErrorMessage = '';
    this.sessionSuccessMessage = '';

    // automatski skrol do forme
    setTimeout(() => {
      const formElement = document.querySelector('.add-session-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  onSubmitSession() {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    this.isSubmittingSession = true;
    this.sessionErrorMessage = '';
    this.sessionSuccessMessage = '';

    const formValue = this.sessionForm.getRawValue();
    const sessionData = {
      date: formValue.date as string,
      time: formValue.time as string,
      type: formValue.type as string,
      maxParticipants: formValue.maxParticipants as number,
    };

    if (this.editingSessionId) {
      this.sessionService.updateSession(this.editingSessionId, sessionData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (session) => {
            this.isSubmittingSession = false;
            this.sessionSuccessMessage = 'Training session successfully updated!';
            this.sessionForm.reset();
            this.showSessionForm = false;
            this.editingSessionId = null;
 
            setTimeout(() => {
              this.loadSessions();
              this.sessionSuccessMessage = '';
            }, 2000);
          },
          error: (err) => {
            this.isSubmittingSession = false;
            this.sessionErrorMessage = err.error?.message || 'Error with updating training session. Please try again.';
          }
        });
    } else {
      this.sessionService.createMySession(sessionData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (session) => {
            this.isSubmittingSession = false;
            this.sessionSuccessMessage = 'Training session successfully created!';
            this.sessionForm.reset();
            this.showSessionForm = false;
            
            setTimeout(() => {
              this.loadSessions();
              this.sessionSuccessMessage = '';
            }, 2000);
          },
          error: (err) => {
            this.isSubmittingSession = false;
            this.sessionErrorMessage = err.error?.message || 'Error with creating training session. Please try again.'; 
          }
        });
    }
  }

  getRegisteredCount(session: TrainingSession): number {
    return session.registrations?.length || 0;
  }

  isUpcoming(session: TrainingSession): boolean {
    const sessionDate = new Date(session.date + 'T' + session.time);
    const now = new Date();
    return sessionDate >= now;
  }

  isPastSession(session: TrainingSession): boolean {
    const sessionDate = new Date(session.date + 'T' + session.time);
    return sessionDate < new Date();
  }


  deleteSession(session: TrainingSession) {
    const registeredCount = this.getRegisteredCount(session);
    const message = registeredCount > 0
      ? `Are you sure you want to delete this training? ${registeredCount} member(s) are registered for this training.`
      : 'Are you sure you want to delete this training?';

    if (!confirm(message)) {
      return;
    }

    this.sessionService.deleteSession(session.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.sessionSuccessMessage = 'Training session was successfully deleted!';
          setTimeout(() => {
            this.loadSessions();
            this.sessionSuccessMessage = '';
          }, 2000);
        },
        error: (err) => {
          this.sessionErrorMessage = err.error?.message || 'Error with deleting training session. Please try again.';
          setTimeout(() => {
            this.sessionErrorMessage = '';
          }, 3000);
        }
      });
  }

  toggleMembersList(session: TrainingSession) {
    const sessionId = session.id;
    this.showMembersForSession[sessionId] = !this.showMembersForSession[sessionId];

    if (this.showMembersForSession[sessionId] && !this.sessionMembers[sessionId]) {
      this.loadSessionMembers(sessionId);
    }
  }

  loadSessionMembers(sessionId: number) {
    this.loadingMembers[sessionId] = true;
    this.sessionService.getRegisteredMembers(sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.sessionMembers[sessionId] = members;
          this.loadingMembers[sessionId] = false;
        },
        error: (err) => {
          console.error('Error loading members for session:', err);
          this.sessionMembers[sessionId] = [];
          this.loadingMembers[sessionId] = false;
        }
      });
  }
}
