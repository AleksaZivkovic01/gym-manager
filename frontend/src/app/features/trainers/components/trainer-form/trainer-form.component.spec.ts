import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerFormComponent } from './trainer-form.component';

describe('TrainerFormComponent', () => {
  let component: TrainerFormComponent;
  let fixture: ComponentFixture<TrainerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
