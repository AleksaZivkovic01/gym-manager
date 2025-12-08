import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { TrainerService } from '../../../features/trainers/services/trainer.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../../features/users/services/user.service';
import { Trainer } from '../../models/trainer.model';
import { User } from '../../models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-trainer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-profile.component.html',
  styleUrls: ['./trainer-profile.component.scss'],
})
export class TrainerProfileComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly trainerService = inject(TrainerService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  trainerInfo: Trainer | null = null;
  currentUser: User | null = null;
  loading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  private destroy$ = new Subject<void>();

  profileForm = this.fb.nonNullable.group({
    // Trainer fields
    name: ['', [Validators.required]],
    specialty: ['', [Validators.required]],
    experienceYears: [0, [Validators.required, Validators.min(0)]],
    // User fields
    email: ['', [Validators.required, Validators.email]],
    oldPassword: [''],
    newPassword: ['', [Validators.minLength(6)]],
    confirmPassword: [''],
  }, {
    validators: [this.passwordMatchValidator]
  });

  // Custom validator for password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return null;
    }
    
    if (newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword.hasError('passwordMismatch') && newPassword.value === confirmPassword.value) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Load current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.profileForm.patchValue({
            email: user.email || '',
          });
        }
      });

    // Load trainer data
    this.loadTrainerData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTrainerData() {
    this.loading = true;
    this.trainerService
      .getMyTrainer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trainer) => {
          this.trainerInfo = trainer;
          this.profileForm.patchValue({
            name: trainer.name || '',
            specialty: trainer.specialty || '',
            experienceYears: trainer.experienceYears || 0,
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading trainer data:', err);
          this.errorMessage = 'Greška pri učitavanju podataka. Molimo osvežite stranicu.';
          this.loading = false;
        },
      });
  }

  onSubmit() {
    if (this.profileForm.invalid || this.isSubmitting || !this.trainerInfo) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // Validate password fields
    const formValue = this.profileForm.getRawValue();
    if (formValue.newPassword) {
      if (!formValue.oldPassword) {
        this.errorMessage = 'Unesite staru lozinku da biste promenili lozinku.';
        this.profileForm.controls.oldPassword.markAsTouched();
        this.profileForm.controls.oldPassword.setErrors({ required: true });
        return;
      }
      if (formValue.newPassword.length < 6) {
        this.errorMessage = 'Nova lozinka mora imati najmanje 6 karaktera.';
        return;
      }
      if (formValue.newPassword === formValue.oldPassword) {
        this.errorMessage = 'Nova lozinka mora biti različita od stare lozinke.';
        return;
      }
      if (formValue.newPassword !== formValue.confirmPassword) {
        this.errorMessage = 'Nova lozinka i potvrda lozinke se ne poklapaju.';
        return;
      }
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Update trainer data
    const trainerUpdateData: Partial<Trainer> = {
      name: formValue.name,
      specialty: formValue.specialty,
      experienceYears: formValue.experienceYears,
    };

    // Update user data (email and/or password)
    const userUpdateData: { email?: string; oldPassword?: string; newPassword?: string } = {};
    
    // Only include email if it's different and not empty
    const trimmedEmail = formValue.email?.trim();
    if (trimmedEmail && trimmedEmail.length > 0 && trimmedEmail !== this.currentUser?.email) {
      userUpdateData.email = trimmedEmail;
    }
    
    // Only include password fields if newPassword is provided
    const trimmedNewPassword = formValue.newPassword?.trim();
    if (trimmedNewPassword && trimmedNewPassword.length >= 6) {
      const trimmedOldPassword = formValue.oldPassword?.trim();
      if (trimmedOldPassword && trimmedOldPassword.length > 0) {
        userUpdateData.oldPassword = trimmedOldPassword;
      }
      userUpdateData.newPassword = trimmedNewPassword;
    }

    // Update trainer first, then user
    this.trainerService.updateMyTrainer(trainerUpdateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (trainer) => {
          this.trainerInfo = trainer;
          
          // Check if password or email was changed
          const passwordChanged = formValue.newPassword && formValue.newPassword.length > 0;
          const emailChanged = formValue.email && formValue.email !== this.currentUser?.email;
          
          // If user data needs to be updated
          if (Object.keys(userUpdateData).length > 0) {
            this.userService.updateMe(userUpdateData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (user) => {
                  this.isSubmitting = false;
                  
                  // If password or email changed, logout user and redirect to login
                  this.successMessage = passwordChanged && emailChanged
                    ? 'Email i lozinka su uspešno ažurirani! Preusmeravanje na prijavu...'
                    : passwordChanged
                    ? 'Lozinka je uspešno ažurirana! Preusmeravanje na prijavu...'
                    : 'Email je uspešno ažuriran! Preusmeravanje na prijavu...';
                  
                  // Logout and redirect to login
                  setTimeout(() => {
                    this.authService.logout();
                    this.router.navigate(['/login'], {
                      queryParams: { 
                        message: passwordChanged && emailChanged
                          ? 'Email i lozinka su promenjeni. Molimo prijavite se sa novim podacima.'
                          : passwordChanged
                          ? 'Lozinka je promenjena. Molimo prijavite se sa novom lozinkom.'
                          : 'Email je promenjen. Molimo prijavite se sa novim email-om.'
                      }
                    });
                  }, 1000);
                },
                error: (err) => {
                  console.error('Error updating user:', err);
                  this.isSubmitting = false;
                  this.errorMessage =
                    err?.error?.message || 'Greška pri ažuriranju email-a ili lozinke. Molimo pokušajte ponovo.';
                }
              });
          } else {
            // Only trainer data changed, no need to logout
            this.isSubmitting = false;
            this.successMessage = 'Podaci su uspešno ažurirani!';
            
            // Refresh current user data to update header
            this.authService.refreshCurrentUser();
            
            // Navigate to dashboard after showing success message
            setTimeout(() => {
              this.router.navigate(['/trainer/dashboard']);
            }, 1500);
          }
        },
        error: (err) => {
          console.error('Error updating trainer:', err);
          this.isSubmitting = false;
          this.errorMessage =
            err?.error?.message || 'Greška pri ažuriranju podataka. Molimo pokušajte ponovo.';
        }
      });
  }

  cancel() {
    // Navigate to trainer dashboard
    this.router.navigate(['/trainer/dashboard']);
  }
}
