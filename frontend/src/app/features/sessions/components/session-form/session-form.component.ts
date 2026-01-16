import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { TrainingSession } from '../../../../shared/models/training-session.model';
import { Member } from '../../../../shared/models/member.model';
import { Trainer } from '../../../../shared/models/trainer.model';
import { Store } from '@ngrx/store';

import { loadTrainers } from '../../../../store/trainer/trainer.actions';
import { selectAllTrainers } from '../../../../store/trainer/trainer.selector';
import { addSession, loadSessions, updateSession } from '../../../../store/session/session.actions';
import { selectSessionById } from '../../../../store/session/session.selector';
import { take } from 'rxjs';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {
  session: Partial<TrainingSession> = {
    id: 0,
    date: '',
    time: '',
    type: '',
    maxParticipants: 10,
    trainer: { id: 0, name: '', specialty: '', experienceYears: undefined, gender: '', dateOfBirth: '' }
  };

  sessionId: number | null = null;
  isEdit = false;

  trainers: Trainer[] = [];

  selectedTrainerId: number = 0;

  constructor(
    private sessionService: SessionService,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.store.dispatch(loadTrainers());

    this.store.select(selectAllTrainers)
      .subscribe(trainers => {
        this.trainers = trainers;
        if (!this.isEdit && trainers.length > 0) {
          this.selectedTrainerId = trainers[0].id;
        }
      });

    
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.sessionId;

    if (this.isEdit) {
      this.store.dispatch(loadSessions());

      this.store.select(selectSessionById(this.sessionId!))
        .subscribe(s => {
          if (s) {
            let normalizedTime = s.time;
            if (normalizedTime && normalizedTime.includes(':')) {
              const parts = normalizedTime.split(':');
              if (parts.length === 3) {
                normalizedTime = `${parts[0]}:${parts[1]}`; // da se uklone sekunde 
              }
            }

            this.session = {
              id: s.id,
              date: s.date,
              time: normalizedTime,
              type: s.type,
              maxParticipants: s.maxParticipants || 10,
              trainer: { ...s.trainer }
            };

            this.selectedTrainerId = s.trainer.id;
          }
        });
    }
  }

  saveSession() {
    if (!this.session.date || !this.session.time || !this.session.type || 
        !this.session.maxParticipants || !this.selectedTrainerId || 
        this.session.maxParticipants < 1) {
      return;
    }

    // Izbor trainer objekta
    const trainer = this.trainers.find(t => t.id === +this.selectedTrainerId)!;

    // Priprema objekta za store i backend
    // Backend će normalizovati vreme (ukloniti sekunde ako postoje)
    const sessionToStore: Partial<TrainingSession> = {
      ...this.session,
      trainer
    };

    if (this.isEdit) {
      this.sessionService.updateSession(this.sessionId!, sessionToStore)
        .subscribe({
          next: () => {
            this.router.navigate(['/sessions']);
          },
          error: (err) => {
            alert(err.error?.message || 'Greška pri ažuriranju sesije');
          }
        });
    } else {
      this.sessionService.addSession(sessionToStore)
        .subscribe({
          next: () => {
            this.router.navigate(['/sessions']);
          },
          error: (err) => {
            alert(err.error?.message || 'Greška pri dodavanju sesije');
          }
        });
    }
  }

  goBack() {
    this.router.navigate(['/sessions']);
  }
}
