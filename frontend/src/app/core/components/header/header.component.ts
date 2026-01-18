import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  currentUser$: Observable<User | null> = this.authService.currentUser$;
  unreadCount = 0;
  showNotifications = false;
  isHomePage = false;

  navLinks = {
    guest: [
      { label: 'Home', path: '/' },
      { label: 'Packages', path: '/guest/packages' },
      { label: 'Trainers', path: '/guest/trainers' },
      { label: 'Trainings', path: '/guest/available-sessions' },
      { label: 'About', path: '/guest/about' },
    ],
    member: [
      { label: 'Home', path: '/member/dashboard' },
      { label: 'Packages', path: '/member/packages' },
      {label:'Trainings',path: '/member/available-sessions'},
      { label: 'Trainers', path: '/member/trainers' }
      
    ],
    trainer: [
      { label: 'Home', path: '/trainer/dashboard' },
      { label: 'Training Sessions', path: '/trainer/sessions' },
    ],
    admin: [
      { label: 'Home', path: '/admin/dashboard' },
      { label: 'Members', path: '/members' },
      { label: 'Trainers', path: '/trainers' },
      { label: 'Sessions', path: '/sessions' }
    ]
  };
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }

  getUserDisplayName(user: User): string {
    if (user.member?.name) {
      return user.member.name;
    }
    if (user.trainer?.name) {
      return user.trainer.name;
    }
    return user.email;
  }

  ngOnInit() {
    // provera da li smo na home stranici
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.isHomePage = this.router.url === '/' || this.router.url === '';
      });
    
   
    this.isHomePage = this.router.url === '/' || this.router.url === '';

    // load unread notifications
    this.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user?.role === 'member') {
          this.loadUnreadCount();
          // svakih 30 sekundi
          interval(30000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadUnreadCount());
          
          
          this.notificationService.notificationRead
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadUnreadCount());
        } else {
          this.unreadCount = 0;
        }
      });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.unreadCount = result.count;
        },
        error: () => {
          this.unreadCount = 0;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.router.navigate(['/member/notifications']);
    }
  }
}
