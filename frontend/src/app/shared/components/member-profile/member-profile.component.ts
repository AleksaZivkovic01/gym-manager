import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberService } from '../../../features/members/services/member.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserService } from '../../../features/users/services/user.service';
import { Member } from '../../models/member.model';
import { User } from '../../models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss'],
})
export class MemberProfileComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  memberInfo: Member | null = null;
  currentUser: User | null = null;
  loading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  private destroy$ = new Subject<void>();

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    level: ['beginner' as 'beginner' | 'medium' | 'expert', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    oldPassword: [''],
    newPassword: ['', [Validators.minLength(6)]],
    confirmPassword: [''],
  }, {
    validators: [this.passwordMatchValidator]
  });


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


    this.loadMemberData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMemberData() {
    this.loading = true;
    this.memberService
      .getMyMember()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.memberInfo = member;
          if (member) {
            this.profileForm.patchValue({
              name: member.name || '',
              level: member.level || 'beginner',
            });
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading member data:', err);
          this.errorMessage = 'Error loading member data. Please refresh the page.';
          this.loading = false;
        },
      });
  }

  onSubmit() {
    if (this.profileForm.invalid || this.isSubmitting || !this.memberInfo) {
      this.profileForm.markAllAsTouched();
      return;
    }


    const formValue = this.profileForm.getRawValue();
    if (formValue.newPassword) {
      if (!formValue.oldPassword) {
        this.errorMessage = 'Enter your old password to set a new password.';
        this.profileForm.controls.oldPassword.markAsTouched();
        this.profileForm.controls.oldPassword.setErrors({ required: true });
        return;
      }
      if (formValue.newPassword.length < 6) {
        this.errorMessage = 'New password must be at least 6 characters long.';
        return;
      }
      if (formValue.newPassword === formValue.oldPassword) {
        this.errorMessage = 'New password must be different from the old password.';
        return;
      }
      if (formValue.newPassword !== formValue.confirmPassword) {
        this.errorMessage = 'New password and confirm password does not match.';
        return;
      }
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

  
    const memberUpdateData: Partial<Member> = {
      name: formValue.name,
      level: formValue.level,
    };

    
    const userUpdateData: { email?: string; oldPassword?: string; newPassword?: string } = {};
    
    
    const trimmedEmail = formValue.email?.trim();
    if (trimmedEmail && trimmedEmail.length > 0 && trimmedEmail !== this.currentUser?.email) {
      userUpdateData.email = trimmedEmail;
    }
    
    
    const trimmedNewPassword = formValue.newPassword?.trim();
    if (trimmedNewPassword && trimmedNewPassword.length >= 6) {
      const trimmedOldPassword = formValue.oldPassword?.trim();
      if (trimmedOldPassword && trimmedOldPassword.length > 0) {
        userUpdateData.oldPassword = trimmedOldPassword;
      }
      userUpdateData.newPassword = trimmedNewPassword;
    }

    
    this.memberService.updateMyMember(memberUpdateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.memberInfo = member;
          
          
          const passwordChanged = formValue.newPassword && formValue.newPassword.length > 0;
          const emailChanged = formValue.email && formValue.email !== this.currentUser?.email;
          
        
          if (Object.keys(userUpdateData).length > 0) {
            this.userService.updateMe(userUpdateData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (user) => {
                  this.isSubmitting = false;
                  
                  
                  this.successMessage = passwordChanged && emailChanged
                    ? 'Email and password have been successfully updated! Redirecting to login...'
                    : passwordChanged
                    ? 'Password has been successfully updated! Redirecting to login...'
                    : 'Email has been successfully updated! Redirecting to login...';
                  
                  // Logout and redirect to login
                  setTimeout(() => {
                    this.authService.logout();
                    this.router.navigate(['/login'], {
                      queryParams: { 
                        message: passwordChanged && emailChanged
                          ? 'Email and password have been changed. Please log in with your new email and password.'
                          : passwordChanged
                          ? 'Password has been changed. Please log in with your new password.'
                          : 'Email has been changed. Please log in with your new email.'
                      }
                    });
                  }, 1000);
                },
                error: (err) => {
                  console.error('Error updating user:', err);
                  this.isSubmitting = false;
                  this.errorMessage =
                    err?.error?.message || 'Error with updating user data. Please try again.';
                }
              });
          } else {
           
            this.isSubmitting = false;
            this.successMessage = 'Data has been successfully updated!';           
            this.authService.refreshCurrentUser();
            setTimeout(() => {
              this.router.navigate(['/member/dashboard']);
            }, 1500);
          }
        },
        error: (err) => {
          console.error('Error updating member:', err);
          this.isSubmitting = false;
          this.errorMessage =
            err?.error?.message || 'Error with updating member data. Please try again.';
        }
      });
  }

  cancel() {
    this.router.navigate(['/member/dashboard']);
  }
}
