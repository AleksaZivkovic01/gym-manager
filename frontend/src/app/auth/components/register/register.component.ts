import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';

import { AuthService } from '../../services/auth.service';
import { MemberRegisterData, RegisterRequest, TrainerRegisterData } from '../../models/auth.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  isSubmitting = false;
  authError = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['member' as 'member' | 'trainer'],

    // Member fields
    memberName: [''],
    memberLevel: ['beginner' as MemberRegisterData['level']],
    memberGender: [''],
    memberDateOfBirth: [''],

    // Trainer fields
    trainerName: [''],
    trainerSpecialty: [''],
    trainerExperienceYears: [0],
    trainerGender: [''],
    trainerDateOfBirth: [''],
  });

  constructor() {
    this.setupRoleValidators();
  }

  ngOnInit(): void {
    this.setupAuthSubscriptions();
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
        ofType(AuthActions.registerSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isSubmitting = false;
        alert('Registration is successful! Please wait for admin approval.');
        this.router.navigate(['/login'], {
          queryParams: { message: 'Registration successful! Please wait for admin approval.' }
        });
      });

 
    this.actions$
      .pipe(
        ofType(AuthActions.registerFailure),
        takeUntil(this.destroy$)
      )
      .subscribe(({ error }) => {
        this.isSubmitting = false;
        this.authError = error;
      });
  }

  private setupRoleValidators(): void {
    const roleControl = this.form.controls.role;

    const applyValidators = (role: 'member' | 'trainer') => {
      const memberName = this.form.controls.memberName;
      const memberLevel = this.form.controls.memberLevel;
      const memberGender = this.form.controls.memberGender;
      const memberDateOfBirth = this.form.controls.memberDateOfBirth;

      const trainerName = this.form.controls.trainerName;
      const trainerSpecialty = this.form.controls.trainerSpecialty;
      const trainerExperienceYears = this.form.controls.trainerExperienceYears;
      const trainerGender = this.form.controls.trainerGender;
      const trainerDateOfBirth = this.form.controls.trainerDateOfBirth;

      if (role === 'member') {
        memberName.setValidators([Validators.required]);
        memberLevel.setValidators([Validators.required]);
        memberGender.setValidators([Validators.required]);
        memberDateOfBirth.setValidators([Validators.required]);

        trainerName.clearValidators();
        trainerSpecialty.clearValidators();
        trainerExperienceYears.clearValidators();
        trainerGender.clearValidators();
        trainerDateOfBirth.clearValidators();
      } else {
        trainerName.setValidators([Validators.required]);
        trainerSpecialty.setValidators([Validators.required]);
        trainerExperienceYears.setValidators([Validators.required]);
        trainerGender.setValidators([Validators.required]);
        trainerDateOfBirth.setValidators([Validators.required]);

        memberName.clearValidators();
        memberLevel.clearValidators();
        memberGender.clearValidators();
        memberDateOfBirth.clearValidators();
      }

      memberName.updateValueAndValidity();
      memberLevel.updateValueAndValidity();
      memberGender.updateValueAndValidity();
      memberDateOfBirth.updateValueAndValidity();
      trainerName.updateValueAndValidity();
      trainerSpecialty.updateValueAndValidity();
      trainerExperienceYears.updateValueAndValidity();
      trainerGender.updateValueAndValidity();
      trainerDateOfBirth.updateValueAndValidity();
    };

    // initial state
    applyValidators(roleControl.value);

    roleControl.valueChanges.subscribe((value) => {
      applyValidators(value as 'member' | 'trainer');
    });
  }

  private buildPayload(): RegisterRequest {
    const raw = this.form.getRawValue();

    const base = {
      email: raw.email,
      password: raw.password,
      role: raw.role,
    } as RegisterRequest;

    if (raw.role === 'member') {
      const member: MemberRegisterData = {
        name: raw.memberName,
        level: raw.memberLevel,
        gender: raw.memberGender || undefined,
        dateOfBirth: raw.memberDateOfBirth || undefined,
      };

      return { ...base, member };
    }

    const trainer: TrainerRegisterData = {
      name: raw.trainerName,
      specialty: raw.trainerSpecialty,
      experienceYears: raw.trainerExperienceYears || undefined,
      gender: raw.trainerGender || undefined,
      dateOfBirth: raw.trainerDateOfBirth || undefined,
    };

    return { ...base, trainer };
  }

  submit(event?: Event): void {
    // Prevent default form submission and double submission
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    // Additional guard against double submission
    if (this.isSubmitting) {
      return;
    }

    this.authError = '';
    const payload = this.buildPayload();
    
    // Dispatch the register action - the effect will handle the HTTP call
    this.authService.register(payload);
  }
}
