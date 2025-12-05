import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PackageService } from '../../services/package.service';
import { Package } from '../../../../shared/models/package.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss'],
})
export class PackageListComponent implements OnInit, OnDestroy {
  packages: Package[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private packageService: PackageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPackages();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPackages() {
    this.loading = true;
    this.error = null;
    this.packageService
      .getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (packages) => {
          this.packages = packages;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Greška pri učitavanju paketa';
          this.loading = false;
        },
      });
  }

  addPackage() {
    this.router.navigate(['/admin/packages/add']);
  }

  editPackage(id: number) {
    this.router.navigate([`/admin/packages/edit/${id}`]);
  }

  deletePackage(id: number) {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj paket?')) {
      return;
    }

    this.packageService
      .deletePackage(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadPackages();
        },
        error: (err) => {
          alert(err.error?.message || 'Greška pri brisanju paketa');
        },
      });
  }

  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(numPrice)) {
      return '0.00€';
    }
    return `${numPrice.toFixed(2)}€`;
  }

  getSessionsLabel(sessions: number): string {
    return sessions === 0 ? 'Neograničeno' : `${sessions} termina`;
  }
}

