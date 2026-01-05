import { Component, OnDestroy, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Member } from '../../../../shared/models/member.model';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { deleteMember, loadMembers } from '../../../../store/member/member.actions';
import { selectAllMembers } from '../../../../store/member/member.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})

export class MemberListComponent implements OnInit,OnDestroy {
  members: Member[] = [];
  searchTerm: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router
  ) {}

  ngOnInit() {
    this.store.dispatch(loadMembers());

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

  get filteredMembers(): Member[] {
    if (!this.searchTerm.trim()) {
      return this.members;
    }
    const search = this.searchTerm.toLowerCase().trim();
    return this.members.filter(m => 
      m.name.toLowerCase().includes(search)
    );
  }
}
