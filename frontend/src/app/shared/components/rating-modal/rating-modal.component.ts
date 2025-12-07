import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Rating } from '../../../shared/models/rating.model';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss'],
})
export class RatingModalComponent {
  @Input() trainerName: string = '';
  @Input() existingRating: Rating | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{ rating: number; comment?: string }>();

  selectedRating: number = 0;
  comment: string = '';
  hoveredRating: number = 0;

  ngOnInit() {
    if (this.existingRating) {
      this.selectedRating = this.existingRating.rating;
      this.comment = this.existingRating.comment || '';
    }
  }

  setRating(rating: number) {
    this.selectedRating = rating;
  }

  setHovered(rating: number) {
    this.hoveredRating = rating;
  }

  clearHover() {
    this.hoveredRating = 0;
  }

  getDisplayRating(): number {
    return this.hoveredRating || this.selectedRating;
  }

  submitRating() {
    if (this.selectedRating >= 1 && this.selectedRating <= 5) {
      this.submit.emit({
        rating: this.selectedRating,
        comment: this.comment.trim() || undefined
      });
    }
  }

  closeModal() {
    this.close.emit();
  }
}

