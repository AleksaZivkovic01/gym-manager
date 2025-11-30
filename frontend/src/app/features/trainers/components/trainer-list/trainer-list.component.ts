import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TrainerService } from '../../services/trainer.service';
import { Trainer } from '../../../../shared/models/trainer.model';

@Component({
  selector: 'app-trainer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.scss']
})
export class TrainerListComponent implements OnInit, OnDestroy {
  trainers: Trainer[] = [];
  private destroy$ = new Subject<void>();

  constructor(private trainerService: TrainerService, private router: Router) {}

  ngOnInit() {
    this.trainerService.trainers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.trainers = data;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addTrainer() {
    this.router.navigate(['/trainers/add']);
  }

  editTrainer(id: number) {
    this.router.navigate([`/trainers/edit/${id}`]);
  }

  deleteTrainer(id: number) {
    if (confirm('Are you sure you want to delete this trainer?')) {
      this.trainerService.deleteTrainer(id).subscribe();
    }
  }

  trackById(index: number, trainer: Trainer) {
    return trainer.id;
  }
}
