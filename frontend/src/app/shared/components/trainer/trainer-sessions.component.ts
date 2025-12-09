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
  loading = true;
  showSessionForm = false;
  isSubmittingSession = false;
  sessionErrorMessage = '';
  sessionSuccessMessage = '';
  editingSessionId: number | null = null;
  showMembersForSession: { [sessionId: number]: boolean } = {};
  sessionMembers: { [sessionId: number]: Member[] } = {};
  loadingMembers: { [sessionId: number]: boolean } = {};
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
    return 'Trener';
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
          this.sessions = sessions.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA.getTime() - dateB.getTime();
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading sessions:', err);
          this.loading = false;
        }
      });
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
    return timeString.substring(0, 5); // da bi se prikazalo samo casovi i minuti bez sekundi,prva 5 karaktera
  }

  toggleSessionForm() {
    this.showSessionForm = !this.showSessionForm;
    if (!this.showSessionForm) {
      this.sessionForm.reset();
      this.sessionErrorMessage = '';
      this.sessionSuccessMessage = '';
      this.editingSessionId = null;
    }
  }

  editSession(session: TrainingSession) {
    this.editingSessionId = session.id;
    
    // Format date for input (YYYY-MM-DD)
    const sessionDate = new Date(session.date);
    const formattedDate = sessionDate.toISOString().split('T')[0];
    
    // Populate form with session data
    this.sessionForm.patchValue({
      date: formattedDate,
      time: session.time,
      type: session.type,
      maxParticipants: session.maxParticipants
    });
    
    this.showSessionForm = true;
    this.sessionErrorMessage = '';
    this.sessionSuccessMessage = '';
    
    // Scroll to form
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
      // Update existing session
      this.sessionService.updateSession(this.editingSessionId, sessionData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (session) => {
            this.isSubmittingSession = false;
            this.sessionSuccessMessage = 'Trening sesija je uspešno izmenjena!';
            this.sessionForm.reset();
            this.showSessionForm = false;
            this.editingSessionId = null;
            
            // Reload sessions after a short delay
            setTimeout(() => {
              this.loadSessions();
              this.sessionSuccessMessage = '';
            }, 2000);
          },
          error: (err) => {
            this.isSubmittingSession = false;
            this.sessionErrorMessage = err.error?.message || 'Greška pri izmeni trening sesije. Molimo pokušajte ponovo.';
          }
        });
    } else {
      // Create new session
      this.sessionService.createMySession(sessionData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (session) => {
            this.isSubmittingSession = false;
            this.sessionSuccessMessage = 'Trening sesija je uspešno kreirana!';
            this.sessionForm.reset();
            this.showSessionForm = false;
            
            // Reload sessions after a short delay
            setTimeout(() => {
              this.loadSessions();
              this.sessionSuccessMessage = '';
            }, 2000);
          },
          error: (err) => {
            this.isSubmittingSession = false;
            this.sessionErrorMessage = err.error?.message || 'Greška pri kreiranju trening sesije. Molimo pokušajte ponovo.';
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

  deleteSession(session: TrainingSession) {
    const registeredCount = this.getRegisteredCount(session);
    const message = registeredCount > 0
      ? `Da li ste sigurni da želite da obrišete ovaj trening? ${registeredCount} član(ova) je prijavljeno na ovaj trening.`
      : 'Da li ste sigurni da želite da obrišete ovaj trening?';

    if (!confirm(message)) {
      return;
    }

    this.sessionService.deleteSession(session.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.sessionSuccessMessage = 'Trening sesija je uspešno obrisana!';
          // Reload sessions after a short delay
          setTimeout(() => {
            this.loadSessions();
            this.sessionSuccessMessage = '';
          }, 2000);
        },
        error: (err) => {
          this.sessionErrorMessage = err.error?.message || 'Greška pri brisanju trening sesije. Molimo pokušajte ponovo.';
          setTimeout(() => {
            this.sessionErrorMessage = '';
          }, 3000);
        }
      });
  }

  toggleMembersList(session: TrainingSession) {
    const sessionId = session.id;
    this.showMembersForSession[sessionId] = !this.showMembersForSession[sessionId];

    // Load members if not already loaded and showing
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
