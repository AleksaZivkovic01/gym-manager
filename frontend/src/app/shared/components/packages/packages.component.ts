import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PackageService } from '../../../features/packages/services/package.service';
import { MemberService } from '../../../features/members/services/member.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Package } from '../../../shared/models/package.model';
import { Member } from '../../../shared/models/member.model';
import { User } from '../../../shared/models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent implements OnInit, OnDestroy {
  packages: Package[] = [];
  currentUser: User | null = null;
  currentMember: Member | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private packageService: PackageService,
    private memberService: MemberService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load packages
    this.packageService.getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (packages) => {
          this.packages = packages.filter(p => p.isActive);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });

    
    this.authService.currentUser$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(user => {
        this.currentUser = user;
        if (user && user.role === 'member') {
          this.loadMemberData();
        } else {
          this.currentMember = null;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMemberData() {
    if (!this.currentUser) {
      this.currentMember = null;
      return;
    }

    this.memberService.getMyMember()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.currentMember = member;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading member data:', err);
          this.currentMember = null;
        }
      });
  }

  selectPackage(pkg: Package) {
    if (!this.currentUser || this.currentUser.role !== 'member') {
      alert('You must be logged in as a member to select a package.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.currentMember) {
      alert('You are not registered as a member.');
      return;
    }

    if (confirm(`Do you want to select package "${pkg.name}"?`)) {
      const updateData = {
        packageId: pkg.id
      };

      this.memberService.updateMyMember(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert(`Successfully selected package "${pkg.name}"! Your membership is now active.`);
            this.loadMemberData();
          },
          error: (err) => {
            alert(err.error?.message || 'Error selecting package');
          }
        });
    }
  }

  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(numPrice)) {
      return '0.00€';
    }
    return `${numPrice.toFixed(2)}€`;
  }

  getSessionsLabel(sessions: number): string {
    return sessions === 0 ? 'Unlimited' : `${sessions} sessions`;
  }

  hasPackage(pkgId: number): boolean {
    return this.currentMember?.packageId === pkgId;
  }
}


