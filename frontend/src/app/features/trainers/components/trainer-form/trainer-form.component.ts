import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { Trainer } from '../../../../shared/models/trainer.model';

@Component({
  selector: 'app-trainer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-form.component.html',
  styleUrls: ['./trainer-form.component.scss']
})
export class TrainerFormComponent implements OnInit {
  isEdit = false;
  trainerId: number | null = null;

  trainer: Trainer = { id: 0, name: '', specialty: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    this.trainerId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.trainerId;

    if (this.isEdit) {
      this.trainerService.getTrainer(this.trainerId!).subscribe(data => {
        this.trainer = data;
      });
    }
  }

  saveTrainer(): void {
    if (this.isEdit) {
      this.trainerService.updateTrainer(this.trainerId!, this.trainer).subscribe(() => {
        this.router.navigate(['/trainers']);
      });
    } else {
      this.trainerService.addTrainer(this.trainer).subscribe(() => {
        this.router.navigate(['/trainers']);
      });
    }
  }
}
