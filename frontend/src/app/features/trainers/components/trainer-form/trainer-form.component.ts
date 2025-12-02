import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Trainer } from '../../../../shared/models/trainer.model';
import { loadTrainers, addTrainer, updateTrainer } from '../../../../store/trainer/trainer.actions';
import { selectTrainerById } from '../../../../store/trainer/trainer.selector';

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
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.trainerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      specialty: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.trainerId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.trainerId;

    if (this.isEdit) {
      this.store.dispatch(loadTrainers());

      this.store.select(selectTrainerById(this.trainerId!))
        .subscribe(trainer => {
          if (trainer) {
            this.trainerForm.patchValue({
              name: trainer.name,
              specialty: trainer.specialty
            });
          }
        });
    }
  }

  saveTrainer(): void {
    // Ako je ADD → ne šaljemo id
    if (!this.isEdit) {
      const trainerData = this.trainerForm.value;
      this.store.dispatch(addTrainer({ trainer: trainerData }));
      this.router.navigate(['/trainers']);
      return;
    }
    // Ako je EDIT → šaljemo id
    const trainer: Trainer = {
      id: this.trainerId!,
      ...this.trainerForm.value
    };

    this.store.dispatch(updateTrainer({ trainer }));
    this.router.navigate(['/trainers']);
  }
}
