import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { TrainingSession } from '../../../../shared/models/training-session.model';
import { select, Store } from '@ngrx/store';
import { deleteSession, loadSessions } from '../../../../store/session/session.actions';
import { selectAllSessions } from '../../../../store/session/session.selector';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit, OnDestroy {
  sessions: TrainingSession[] = [];
  private destroy$ = new Subject<void>();

  constructor(private store: Store, private router: Router) {}

  ngOnInit() {
    this.store.dispatch(loadSessions());
    this.store.pipe(select(selectAllSessions))
      .pipe(takeUntil(this.destroy$))
      .subscribe(sessions => {
        this.sessions = sessions;
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
}
