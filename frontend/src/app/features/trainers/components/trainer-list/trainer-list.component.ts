import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { Trainer } from '../../../../shared/models/trainer.model';

@Component({
  selector: 'app-trainer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.scss']
})
export class TrainerListComponent implements OnInit {
  trainers: Trainer[] = [];

  constructor(private trainerService: TrainerService, private router: Router) {}

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.trainerService.getTrainers().subscribe(data => {
      this.trainers = data;
    });
  }

  addTrainer(): void {
    this.router.navigate(['/trainers/add']);
  }

  editTrainer(id: number): void {
    this.router.navigate([`/trainers/edit/${id}`]);
  }

  deleteTrainer(id: number): void {
    this.trainerService.deleteTrainer(id).subscribe(() => {
      this.loadTrainers();
    });
  }
}
