import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../services/member.service';
import { Member } from '../../../../shared/models/member.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pending-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-packages.component.html',
  styleUrls: ['./pending-packages.component.scss'],
})
export class PendingPackagesComponent implements OnInit, OnDestroy {
  pendingMembers: Member[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private memberService: MemberService) {}

  ngOnInit() {
    this.loadPendingPackages();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPendingPackages() {
    this.loading = true;
    this.error = null;
    this.memberService
      .getPendingPackageRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.pendingMembers = members;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error loading pending package requests';
          this.loading = false;
        },
      });
  }

  approvePackage(member: Member) {
    if (!confirm(`Are you sure you want to approve package "${member.package?.name}" for ${member.name}?`)) {
      return;
    }

    this.memberService
      .approvePackage(member.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Package approved successfully! Membership is now active.');
          this.loadPendingPackages();
        },
        error: (err) => {
          alert(err.error?.message || 'Error approving package');
        },
      });
  }

  rejectPackage(member: Member) {
    if (!confirm(`Are you sure you want to reject package request for ${member.name}?`)) {
      return;
    }

    this.memberService
      .rejectPackage(member.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          alert('Package request rejected.');
          this.loadPendingPackages();
        },
        error: (err) => {
          alert(err.error?.message || 'Error rejecting package');
        },
      });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
