import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Member } from '../../../../shared/models/member.model';
import { addMember, loadMembers, updateMember } from '../../../../store/member/member.actions';
import { Store } from '@ngrx/store';
import { selectMemberById } from '../../../../store/member/member.selector';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss'],
})
export class MemberFormComponent implements OnInit {
  memberForm: FormGroup;
  memberId: number | null = null;
  isEdit = false;

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.memberForm = new FormGroup({
      name: new FormControl('', Validators.required),
      level: new FormControl('', Validators.required),
      isActive: new FormControl(true)
    });
  }

  ngOnInit() {
    this.memberId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.memberId;

    if (this.isEdit) {
      this.store.dispatch(loadMembers());
      this.store.select(selectMemberById(this.memberId!))
        .subscribe(member => {
          if (member) {
            this.memberForm.patchValue(member);
          }
        });
    }
  }

  save() {
    const member: Member = {
      id: this.memberId!,
      ...this.memberForm.value
    };

    if (this.isEdit) {
      this.store.dispatch(updateMember({ member }));
    } else {
      this.store.dispatch(addMember({ member }));
    }

    this.router.navigate(['/members']);
  }
}


