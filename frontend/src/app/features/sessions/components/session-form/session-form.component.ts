import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { TrainingSession } from '../../../../shared/models/training-session.model';
import { Member } from '../../../../shared/models/member.model';
import { Trainer } from '../../../../shared/models/trainer.model';
import { Store } from '@ngrx/store';

import { loadMembers } from '../../../../store/member/member.actions';
import { selectAllMembers } from '../../../../store/member/member.selector';
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
  session: TrainingSession = {
    id: 0,
    date: '',
    time: '',
    type: '',
    member: { id: 0, name: '', membershipType: '', isActive: true },
    trainer: { id: 0, name: '', specialty: '' }
  };

  sessionId: number | null = null;
  isEdit = false;

  members: Member[] = [];
  trainers: Trainer[] = [];

  selectedMemberId: number = 0;
  selectedTrainerId: number = 0;

  constructor(
    private sessionService: SessionService,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {}

 ngOnInit() {
  this.store.dispatch(loadMembers());
  this.store.dispatch(loadTrainers());

  this.store.select(selectAllMembers)
  .subscribe(members => {
    this.members = members;
    if (!this.isEdit) this.selectedMemberId = members[0]?.id ?? 0;
  });

  this.store.select(selectAllTrainers)
  .subscribe(trainers => {
    this.trainers = trainers;
    if (!this.isEdit) this.selectedTrainerId = trainers[0]?.id ?? 0;
  });
  

  // EDIT MODE
  this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
  this.isEdit = !!this.sessionId;

  if (this.isEdit) {
    this.store.dispatch(loadSessions());

    this.store.select(selectSessionById(this.sessionId!))
              .subscribe(s => {
                if (s) {
                  this.session = {
                    id: s.id,
                    date: s.date,
                    time: s.time,
                    type: s.type,
                    member: { ...s.member },
                    trainer: { ...s.trainer }
                  };

                  this.selectedMemberId = s.member.id;
                  this.selectedTrainerId = s.trainer.id;
                }
              });
  }
}


  saveSession() {
  const member = this.members.find(m => m.id === +this.selectedMemberId)!;
  const trainer = this.trainers.find(t => t.id === +this.selectedTrainerId)!;

  const sessionToSend: TrainingSession = {
    ...this.session,
    member,
    trainer
  };

  if (this.isEdit) {
    this.store.dispatch(updateSession({ session: sessionToSend }));
  } else {
    this.store.dispatch(addSession({ session: sessionToSend }));
  }

  this.router.navigate(['/sessions']);
}


  

}
