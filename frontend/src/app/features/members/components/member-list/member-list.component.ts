import { Component, OnDestroy, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { CommonModule } from '@angular/common';
import { Member } from '../../../../shared/models/member.model';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})

export class MemberListComponent implements OnInit,OnDestroy {
  members: Member[] = [];
  private destroy$ = new Subject<void>();

  constructor(private memberService: MemberService, private router: Router) {}

  ngOnInit() {
    this.memberService.members$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.members = data;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addMember() {
    this.router.navigate(['/members/add']);
  }

  editMember(id: number) {
    this.router.navigate([`/members/edit/${id}`]);
  }

  deleteMember(id: number) {
    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService.deleteMember(id).subscribe();
    }
  }

  //za bolje performanse pri *ngFor
  trackById(index: number, member: Member) {
    return member.id;
  }
}
