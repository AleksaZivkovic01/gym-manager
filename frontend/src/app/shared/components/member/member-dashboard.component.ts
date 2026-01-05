import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { SessionService } from '../../../features/sessions/services/session.service';
import { MemberService } from '../../../features/members/services/member.service';
import { User } from '../../../shared/models/user.model';
import { TrainingSession } from '../../../shared/models/training-session.model';
import { Member } from '../../../shared/models/member.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss'],
})
export class MemberDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  memberInfo: Member | null = null;
  allSessions: TrainingSession[] = [];
  upcomingSessions: TrainingSession[] = [];
  recentSessions: TrainingSession[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private memberService: MemberService
  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadMemberData();
        } else {
          this.memberInfo = null;
          this.allSessions = [];
          this.upcomingSessions = [];
          this.recentSessions = [];
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMemberData() {
    if (!this.currentUser) return;
    
    // Get member data for current user
    this.memberService.getMyMember()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.memberInfo = member;
          // Load sessions after member data is loaded
          this.loadSessions();
        },
        error: (err) => {
          // If member not found, set to null
          this.memberInfo = null;
          this.allSessions = [];
          this.upcomingSessions = [];
          this.recentSessions = [];
          this.loading = false;
        }
      });
  }

  loadSessions() {
    if (!this.memberInfo) {
      this.loading = false;
      this.allSessions = [];
      this.upcomingSessions = [];
      this.recentSessions = [];
      return;
    }

    this.loading = true;
    // Load only sessions where this member is registered
    this.sessionService.getMySessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sessions) => {
          this.allSessions = sessions;
          this.filterSessions();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading sessions:', err);
          this.allSessions = [];
          this.upcomingSessions = [];
          this.recentSessions = [];
          this.loading = false;
        }
      });
  }

  filterSessions() {
    if (!this.currentUser || !this.memberInfo) {
      this.upcomingSessions = [];
      this.recentSessions = [];
      return;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    
    // Separate upcoming and recent sessions (ne ograničavamo broj, svi će biti vidljivi kroz scroll)
    this.upcomingSessions = this.allSessions
      .filter(session => {
        const sessionDateStr = session.date.split('T')[0]; // YYYY-MM-DD format
        const sessionTime = session.time.substring(0, 5); // HH:MM format
        
        // Proveri da li je termin u budućnosti (uzimajući u obzir i datum i vreme)
        if (sessionDateStr > today) {
          return true; // Termin je u budućnosti
        } else if (sessionDateStr === today) {
          return sessionTime >= currentTime; // Termin je danas, proveri vreme
        }
        return false; // Termin je u prošlosti
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        // Ako su isti datum, sortiraj po vremenu
        return a.time.localeCompare(b.time);
      });

    this.recentSessions = this.allSessions
      .filter(session => {
        const sessionDateStr = session.date.split('T')[0]; // YYYY-MM-DD format
        const sessionTime = session.time.substring(0, 5); // HH:MM format
        
        // Proveri da li je termin prošao (uzimajući u obzir i datum i vreme)
        if (sessionDateStr < today) {
          return true; // Termin je u prošlosti
        } else if (sessionDateStr === today) {
          return sessionTime < currentTime; // Termin je danas, proveri da li je vreme prošlo
        }
        return false; // Termin je u budućnosti
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime(); // Najnoviji prvo
        }
        // Ako su isti datum, sortiraj po vremenu (najnoviji prvo)
        return b.time.localeCompare(a.time);
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('EN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    // If time is in format HH:mm:ss, extract only HH:mm
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  }

  getLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'beginner': 'Beginner',
      'medium': 'Intermediate',
      'expert': 'Advanced'
    };
    return labels[level] || level;
  }

  formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(numPrice)) {
      return '0.00€';
    }
    return `${numPrice.toFixed(2)}€`;
  }

  getSessionsLabel(sessions: number): string {
    return sessions === 0 ? 'Unlimited' : `${sessions} `;
  }

  getDisplayName(): string {
    if (this.memberInfo?.name) {
      return this.memberInfo.name;
    }
    if (this.currentUser?.email) {
      return this.currentUser.email;
    }
    return 'Korisnik';
  }

  unregisterFromSession(session: TrainingSession) {
    if (!this.memberInfo) {
      return;
    }

    if (confirm(`Do you want to cancel session "${session.type}" with trainer ${session.trainer?.name}?`)) {
      this.sessionService.unregisterFromSession(session.id, this.memberInfo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            alert('Successfully canceled session!');
            this.loadSessions(); // Reload to update the list
          },
          error: (err) => {
            alert(err.error?.message || 'Error with canceling session');
          }
        });
    }
  }
}


