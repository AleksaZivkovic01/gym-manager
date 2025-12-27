import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { Notification } from '../../../shared/models/notification.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  markAsRead(notification: Notification) {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notification.isRead = true;
            this.notificationService.notifyRead(); // Obavesti header da osveži broj
            this.loadNotifications();
          }
        });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.notifyRead(); // Obavesti header da osveži broj
          this.loadNotifications();
        }
      });
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation(); // Spreči da se označi kao pročitano kada se klikne na delete
    if (confirm('Do you want to delete this notification?')) {
      this.notificationService.delete(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (!notification.isRead) {
              this.notificationService.notifyRead(); // Obavesti header da osveži broj ako je bilo nepročitano
            }
            this.loadNotifications();
          },
          error: () => {
            alert('Error deleting notification');
          }
        });
    }
  }

  deleteAll() {
    if (confirm('Do you want to delete all notifications?')) {
      this.notificationService.deleteAll()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.notifyRead(); // Obavesti header da osveži broj
            this.loadNotifications();
          },
          error: () => {
            alert('Error deleting notification');
          }
        });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }
}
