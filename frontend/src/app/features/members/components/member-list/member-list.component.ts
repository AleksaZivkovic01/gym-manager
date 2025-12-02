import { Component, OnDestroy, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { CommonModule } from '@angular/common';
import { Member } from '../../../../shared/models/member.model';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { deleteMember, loadMembers } from '../../../../store/member/member.actions';
import { selectAllMembers } from '../../../../store/member/member.selector';
import { Store } from '@ngrx/store';

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

  constructor(
    private store: Store,
    private router: Router
  ) {}

  ngOnInit() {
    // učitaj članove iz store-a
    this.store.dispatch(loadMembers());

    // subscribe na store selektor
    this.store.select(selectAllMembers)
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        this.members = members;
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
    if (confirm('Are you sure?')) {
      this.store.dispatch(deleteMember({ id }));
    }
  }

  trackById(i: number, m: Member) {
    return m.id;
  }
}
