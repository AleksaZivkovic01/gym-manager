import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { TrainingSession } from '../../../../shared/models/training-session.model';
import { Member } from '../../../../shared/models/member.model';
import { select, Store } from '@ngrx/store';
import { deleteSession, loadSessions } from '../../../../store/session/session.actions';
import { selectAllSessions } from '../../../../store/session/session.selector';
import { Trainer } from '../../../../shared/models/trainer.model';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit, OnDestroy {
  sessions: TrainingSession[] = [];
  expandedSessionId: number | null = null;
  searchTerm: string = '';
  sessionMembers: { [sessionId: number]: Member[] } = {};
  loadingMembers: { [sessionId: number]: boolean } = {};
  selectedFilter: 'upcoming' | 'past' | 'all' = 'upcoming';
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store, 
    private router: Router,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.store.dispatch(loadSessions());
    this.store.pipe(select(selectAllSessions))
      .pipe(takeUntil(this.destroy$))
      .subscribe(sessions => {
        this.sessions = sessions;
      });

    // auto refresh 
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addSession() {
    this.router.navigate(['/sessions/add']);
  }

  editSession(id: number) {
    this.router.navigate([`/sessions/edit/${id}`]);
  }

  deleteSession(id: number) {
    if (confirm('Are you sure you want to delete this session?')) {
      this.store.dispatch(deleteSession({id}));
    }
  }

  trackById(index: number, session: TrainingSession) {
    return session.id;
  }

  getRegisteredCount(session: TrainingSession): number {
    return session.registrations?.length || 0;
  }

  toggleMembersList(session: TrainingSession) {
    const sessionId = session.id;
    
    if (this.expandedSessionId === sessionId) {
      this.expandedSessionId = null;
    } else { 
      this.expandedSessionId = sessionId;
      
      if (!this.sessionMembers[sessionId]) {
        this.loadSessionMembers(sessionId);
      }
    }
  }

  isExpanded(sessionId: number): boolean {
    return this.expandedSessionId === sessionId;
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

  setFilter(filter: 'upcoming' | 'past' | 'all') {
    this.selectedFilter = filter;
    this.expandedSessionId = null;
  }

  get filteredSessions(): TrainingSession[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

  const search = this.searchTerm.toLowerCase().trim();

  return this.sessions.filter(session => {
    const sessionDateStr = session.date.split('T')[0];
    const sessionTime = session.time.substring(0, 5);

    const isUpcoming =
      sessionDateStr > today ||
      (sessionDateStr === today && sessionTime > currentTime);

    const isPast =
      sessionDateStr < today ||
      (sessionDateStr === today && sessionTime <= currentTime);

    // ⬇ FILTER PO DATUMU
    let dateMatch = false;
    switch (this.selectedFilter) {
      case 'upcoming':
        dateMatch = isUpcoming;
        break;
      case 'past':
        dateMatch = isPast;
        break;
      case 'all':
        dateMatch = true;
        break;
    }

    // ⬇ FILTER PO TRENERU
    const trainerMatch =
      !search ||
      session.trainer?.name?.toLowerCase().includes(search);

    return dateMatch && trainerMatch;
  });
}


  
}
