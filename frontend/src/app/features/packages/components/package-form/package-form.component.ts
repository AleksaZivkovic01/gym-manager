import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PackageService } from '../../services/package.service';
import { Package } from '../../../../shared/models/package.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-package-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './package-form.component.html',
  styleUrls: ['./package-form.component.scss'],
})
export class PackageFormComponent implements OnInit {
  packageForm: FormGroup;
  packageId: number | null = null;
  isEdit = false;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private packageService: PackageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.packageForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      price: new FormControl('', [Validators.required, Validators.min(0)]),
      sessionsPerMonth: new FormControl('', [Validators.required, Validators.min(0)]),
      isActive: new FormControl(true),
    });
  }

  ngOnInit() {
    this.packageId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.packageId;

    if (this.isEdit && this.packageId) {
      this.loadPackage();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPackage() {
    if (!this.packageId) return;

    this.loading = true;
    this.packageService
      .getPackage(this.packageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pkg) => {
          this.packageForm.patchValue({
            name: pkg.name,
            description: pkg.description || '',
            price: pkg.price,
            sessionsPerMonth: pkg.sessionsPerMonth,
            isActive: pkg.isActive,
          });
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Greška pri učitavanju paketa';
          this.loading = false;
        },
      });
  }

  save() {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const packageData: Package = {
      id: this.packageId || 0,
      ...this.packageForm.value,
      price: parseFloat(this.packageForm.value.price),
      sessionsPerMonth: parseInt(this.packageForm.value.sessionsPerMonth, 10),
    };

    const operation = this.isEdit
      ? this.packageService.updatePackage(this.packageId!, packageData)
      : this.packageService.addPackage(packageData);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.router.navigate(['/admin/packages']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error with saving package';
        this.loading = false;
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/packages']);
  }
}

