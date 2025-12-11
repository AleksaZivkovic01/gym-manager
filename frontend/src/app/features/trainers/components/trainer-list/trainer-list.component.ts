import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Trainer } from '../../../../shared/models/trainer.model';
import { Store } from '@ngrx/store';
import { deleteTrainer, loadTrainers } from '../../../../store/trainer/trainer.actions';
import { selectAllTrainers } from '../../../../store/trainer/trainer.selector';

@Component({
  selector: 'app-trainer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.scss']
})
export class TrainerListComponent implements OnInit, OnDestroy {
  trainers: Trainer[] = [];
  searchTerm: string = '';
  private destroy$ = new Subject<void>();

  constructor(private store: Store, private router: Router) {}

  ngOnInit() {
    this.store.dispatch(loadTrainers());
    this.store.select(selectAllTrainers)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainers => {
        this.trainers = trainers;
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
      this.store.dispatch(deleteTrainer({ id })); 
    }
  }

  trackById(index: number, trainer: Trainer) {
    return trainer.id;
  }

  get filteredTrainers(): Trainer[] {
    if (!this.searchTerm.trim()) {
      return this.trainers;
    }
    const search = this.searchTerm.toLowerCase().trim();
    return this.trainers.filter(t => 
      t.name.toLowerCase().includes(search)
    );
  }
}
