import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MembersState } from './member.state';


export const selectMemberState = createFeatureSelector<MembersState>('members');

export const selectAllMembers = createSelector(selectMemberState, state => state.members);
export const selectMemberById = (id: number) =>
    createSelector(
    selectAllMembers,
    (members) => members.find(m => m.id === id)
  );

export const selectMemberLoading = createSelector(selectMemberState, state => state.loading);
export const selectMemberError = createSelector(selectMemberState, state => state.error);
