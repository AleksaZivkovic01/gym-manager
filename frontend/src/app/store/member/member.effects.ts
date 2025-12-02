import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MemberService } from '../../features/members/services/member.service';
import * as MemberActions from './member.actions';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class MemberEffects {
  private memberService = inject(MemberService);
  private actions$ = inject(Actions);

  // LOAD ALL MEMBERS
  loadMembers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.loadMembers),
      mergeMap(() =>
        this.memberService.getMembers().pipe(
          map(members => MemberActions.loadMembersSuccess({ members })),
          catchError(error =>
            of(MemberActions.loadMembersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // ADD MEMBER
  addMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.addMember),
      mergeMap(({ member }) =>
        this.memberService.addMember(member).pipe(
          map(newMember => MemberActions.addMemberSuccess({ member: newMember })),
          catchError(error =>
            of(MemberActions.addMemberFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // UPDATE MEMBER
  updateMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.updateMember),
      mergeMap(({ member }) =>
        this.memberService.updateMember(member.id, member).pipe(
          map(updated =>
            MemberActions.updateMemberSuccess({ member: updated })
          ),
          catchError(error =>
            of(MemberActions.updateMemberFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // DELETE MEMBER
  deleteMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberActions.deleteMember),
      mergeMap(({ id }) =>
        this.memberService.deleteMember(id).pipe(
          map(() => MemberActions.deleteMemberSuccess({ id })),
          catchError(error =>
            of(MemberActions.deleteMemberFailure({ error: error.message }))
          )
        )
      )
    )
  );
}
