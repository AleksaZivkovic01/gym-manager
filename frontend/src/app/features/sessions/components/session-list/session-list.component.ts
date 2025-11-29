import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingSession } from '../../../../shared/models/training-session.model';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.scss'
})
export class SessionListComponent implements OnInit {

  sessions: TrainingSession[] = [];

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe(data => {
      this.sessions = data;
      console.log("Loaded sessions:", data);
    });
  }

  addSession() {
    this.router.navigate(['/sessions/add']);
  }

  editSession(id: number) {
    this.router.navigate(['/sessions/edit', id]);
  }

  deleteSession(id: number) {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessionService.deleteSession(id).subscribe(() => {
        this.loadSessions();
      });
    }
  }
}
