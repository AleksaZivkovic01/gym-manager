import { Component, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { CommonModule } from '@angular/common';
import { Member } from '../../../../shared/models/member.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})

export class MemberListComponent implements OnInit {
  members: Member[] = [];

  constructor(private memberService: MemberService, private router: Router) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers().subscribe(data => {
      this.members = data;
      console.log('Loaded members:', data);
    });
  }

  addMember() {
    this.router.navigate(['/members/add']);
  }

  editMember(id: number) {
    this.router.navigate([`/members/edit/${id}`]);
  }

  deleteMember(id: number) {
    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService.deleteMember(id).subscribe(() => {
        this.loadMembers(); 
      });
    }
  }
}
