import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../auth/services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser$: Observable<User | null> = this.authService.currentUser$;

  navLinks = {
    guest: [
      { label: 'Home', path: '/' },
      { label: 'Packages', path: '/packages' },
      { label: 'About', path: '/about' }
    ],
    member: [
      { label: 'Home', path: '/' },
      { label: 'Moj nalog', path: '/member/dashboard' }
    ],
    trainer: [
      { label: 'Home', path: '/' },
      { label: 'Trener panel', path: '/trainer/dashboard' }
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
}
