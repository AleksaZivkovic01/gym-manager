import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { MemberService } from '../../../members/services/member.service';
import { TrainerService } from '../../../trainers/services/trainer.service';
import { TrainingSession } from '../../../../shared/models/training-session.model';
import { Member } from '../../../../shared/models/member.model';
import { Trainer } from '../../../../shared/models/trainer.model';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {

  isEdit = false;
  sessionId: number | null = null;

  session: TrainingSession = {
    id: 0,
    date: '',
    time: '',
    type: '',
    member: { id: 0, name: '', membershipType: '', isActive: true },
    trainer: { id: 0, name: '', specialty: '' }
  };

  members: Member[] = [];
  trainers: Trainer[] = [];

  selectedMemberId: number = 0;
  selectedTrainerId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private memberService: MemberService,
    private trainerService: TrainerService
  ) {}

  ngOnInit() {
    // učitaj članove i trenere iz servisa
    this.memberService.getMembers().subscribe(data => {
      this.members = data;
      if (!this.isEdit) this.selectedMemberId = this.members[0]?.id || 0;
    });

    this.trainerService.getTrainers().subscribe(data => {
      this.trainers = data;
      if (!this.isEdit) this.selectedTrainerId = this.trainers[0]?.id || 0;
    });

    // proveri da li je edit
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.sessionId;

    if (this.isEdit) {
      this.sessionService.getSession(this.sessionId!).subscribe(data => {
        this.session = data;
        this.selectedMemberId = data.member.id;
        this.selectedTrainerId = data.trainer.id;
      });
    }
  }

  saveSession() {
    // mapiranje selektovanih ID-eva na objekat
    this.session.member = this.members.find(m => m.id === +this.selectedMemberId)!;
    this.session.trainer = this.trainers.find(t => t.id === +this.selectedTrainerId)!;

    if (this.isEdit) {
      this.sessionService.updateSession(this.sessionId!, this.session).subscribe(() => {
        this.router.navigate(['/sessions']);
      });
    } else {
      this.sessionService.addSession(this.session).subscribe(() => {
        this.router.navigate(['/sessions']);
      });
    }
  }
}
