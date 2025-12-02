import { createAction, props } from '@ngrx/store';
import { Member } from '../../shared/models/member.model';


export const loadMembers = createAction('[Member] Load Members');
export const loadMembersSuccess = createAction('[Member] Load Members Success', props<{ members: Member[] }>());
export const loadMembersFailure = createAction('[Member] Load Members Failure', props<{ error: string }>());

export const addMember = createAction('[Member] Add Member', props<{ member: Member }>());
export const addMemberSuccess = createAction('[Member] Add Member Success', props<{ member: Member }>());
export const addMemberFailure = createAction('[Member] Add Member Failure', props<{ error: string }>());

export const updateMember = createAction('[Member] Update Member', props<{ member: Member }>());
export const updateMemberSuccess = createAction('[Member] Update Member Success', props<{ member: Member }>());
export const updateMemberFailure = createAction('[Member] Update Member Failure', props<{ error: string }>());

export const deleteMember = createAction('[Member] Delete Member', props<{ id: number }>());
export const deleteMemberSuccess = createAction('[Member] Delete Member Success', props<{ id: number }>());
export const deleteMemberFailure = createAction('[Member] Delete Member Failure', props<{ error: string }>());
