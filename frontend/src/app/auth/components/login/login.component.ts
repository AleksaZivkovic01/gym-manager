import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { User } from '../../../shared/models/user.model';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  authError = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.authError = '';

    this.authService.login(this.form.getRawValue() as LoginRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.redirectByRole(response.user);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.authError = err?.error?.message ?? 'Prijava nije uspela. Pokušajte ponovo.';
      },
    });
  }

  private redirectByRole(user: User): void {
    if (user.role === 'member') {
      this.router.navigate(['/member/dashboard']);
    } else if (user.role === 'trainer') {
      this.router.navigate(['/trainer/dashboard']);
    } else if (user.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

