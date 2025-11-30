import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainerService } from '../../services/trainer.service';
import { Trainer } from '../../../../shared/models/trainer.model';

@Component({
  selector: 'app-trainer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-form.component.html',
  styleUrls: ['./trainer-form.component.scss']
})
export class TrainerFormComponent implements OnInit {
  trainerForm: FormGroup;
  trainerId: number | null = null;
  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainerService: TrainerService
  ) {
    // FormGroup sa samo poljima koja želimo da šaljemo
    this.trainerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      specialty: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.trainerId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.trainerId;

    if (this.isEdit) {
      this.loadTrainer(this.trainerId!);
    }
  }

  loadTrainer(id: number) {
    // Pravimo mapiranje samo na name i specialty, ne uključujemo sessions
    this.trainerService.trainers$.subscribe(trainers => {
      const t = trainers.find(x => x.id === id);
      if (t) {
        this.trainerForm.patchValue({
          name: t.name,
          specialty: t.specialty
        });
      }
    });
  }

  saveTrainer(): void {
    const trainerData = this.trainerForm.value; // samo name i specialty

    if (this.isEdit) {
      this.trainerService.updateTrainer(this.trainerId!, trainerData)
        .subscribe(() => this.router.navigate(['/trainers']));
    } else {
      this.trainerService.addTrainer(trainerData)
        .subscribe(() => this.router.navigate(['/trainers']));
    }
  }
}
