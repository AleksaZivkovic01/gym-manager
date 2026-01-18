import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';

import { AuthService } from '../../services/auth.service';
import { User } from '../../../shared/models/user.model';
import { LoginRequest } from '../../models/auth.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  isSubmitting = false;
  authError = '';
  infoMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit() {
    this.setupAuthSubscriptions();
    
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.infoMessage = params['message'];
        this.authError = ''; 
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAuthSubscriptions(): void {
    
    this.authService.authLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isSubmitting = loading;
      });

    this.authService.authError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.authError = error;
        } else {
          this.authError = '';
        }
      });

    
    this.actions$
      .pipe(
        ofType(AuthActions.loginSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(({ response }) => {
        this.isSubmitting = false;
        this.redirectByRole(response.user);
      });

    this.actions$
      .pipe(
        ofType(AuthActions.loginFailure),
        takeUntil(this.destroy$)
      )
      .subscribe(({ error }) => {
        this.isSubmitting = false;
        this.authError = error;
      });
  }

  submit(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    
    if (this.isSubmitting) {
      return;
    }

    this.authError = '';
    const payload = this.form.getRawValue() as LoginRequest;
    
    this.authService.login(payload);
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

