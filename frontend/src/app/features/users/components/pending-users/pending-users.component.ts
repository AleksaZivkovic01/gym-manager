import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../../../shared/models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pending-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-users.component.html',
  styleUrls: ['./pending-users.component.scss'],
})
export class PendingUsersComponent implements OnInit, OnDestroy {
  pendingUsers: User[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadPendingUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPendingUsers() {
    this.loading = true;
    this.error = null;
    this.userService
      .getPendingUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.pendingUsers = users;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Greška pri učitavanju korisnika';
          this.loading = false;
        },
      });
  }

  approveUser(user: User) {
    if (!confirm(`Da li ste sigurni da želite da odobrite korisnika ${user.email}?`)) {
      return;
    }

    this.userService
      .approveUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPendingUsers();
        },
        error: (err) => {
          alert(err.error?.message || 'Greška pri odobravanju korisnika');
        },
      });
  }

  rejectUser(user: User) {
    if (!confirm(`Da li ste sigurni da želite da odbijete korisnika ${user.email}?`)) {
      return;
    }

    this.userService
      .rejectUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPendingUsers();
        },
        error: (err) => {
          alert(err.error?.message || 'Greška pri odbijanju korisnika');
        },
      });
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      member: 'Član',
      trainer: 'Trener',
      admin: 'Admin',
    };
    return labels[role] || role;
  }

  getUserDetails(user: User): string {
    if (user.member) {
      return `Member: ${user.member.name} (${user.member.level})`;
    }
    if (user.trainer) {
      return `Trainer: ${user.trainer.name} - ${user.trainer.specialty}`;
    }
    return '-';
  }
}

