import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { PackageService } from '../../../packages/services/package.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Member } from '../../../../shared/models/member.model';
import { Package } from '../../../../shared/models/package.model';
import { addMember, loadMembers, updateMember } from '../../../../store/member/member.actions';
import { Store } from '@ngrx/store';
import { selectMemberById } from '../../../../store/member/member.selector';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.scss'],
})
export class MemberFormComponent implements OnInit, OnDestroy {
  memberForm: FormGroup;
  memberId: number | null = null;
  isEdit = false;
  packages: Package[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private packageService: PackageService
  ) {
    this.memberForm = new FormGroup({
      name: new FormControl('', Validators.required),
      level: new FormControl('', Validators.required),
      isActive: new FormControl(true),
      packageId: new FormControl(null)
    });
  }

  ngOnInit() {
    // Load packages
    this.packageService.getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(packages => {
        this.packages = packages.filter(p => p.isActive);
      });

    this.memberId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.memberId;

    if (this.isEdit) {
      this.store.dispatch(loadMembers());
      this.store.select(selectMemberById(this.memberId!))
        .pipe(takeUntil(this.destroy$))
        .subscribe(member => {
          if (member) {
            this.memberForm.patchValue({
              name: member.name,
              level: member.level,
              isActive: member.isActive,
              packageId: member.packageId || null
            });
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      return;
    }

    const member: Member = {
      id: this.memberId!,
      ...this.memberForm.value
    };

    if (this.isEdit) {
      this.store.dispatch(updateMember({ member }));
    } else {
      this.store.dispatch(addMember({ member }));
    }

    this.router.navigate(['/members']);
  }

  goBack() {
    this.router.navigate(['/members']);
  }
}


