import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Member } from '../../../../shared/models/member.model';

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
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.memberForm = new FormGroup({
      name: new FormControl('', Validators.required),
      membershipType: new FormControl('', Validators.required),
      isActive: new FormControl(true),
    });
  }

  ngOnInit() {
    this.memberId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.memberId;

    if (this.isEdit) {
      this.loadMember(this.memberId!);
    }
  }

  loadMember(id: number) {
    this.memberService.members$.subscribe((members) => {
      const member = members.find((m) => m.id === id);
      if (member) {
        this.memberForm.patchValue(member);
      }
    });
  }

  save() {
    const member: Member = this.memberForm.value;

    if (this.isEdit) {
      this.memberService.updateMember(this.memberId!, member).subscribe(() => {
        this.router.navigate(['/members']);
      });
    } else {
      this.memberService.addMember(member).subscribe(() => {
        this.router.navigate(['/members']);
      });
    }
  }
}
