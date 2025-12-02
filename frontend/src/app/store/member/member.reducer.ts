import { createReducer, on } from '@ngrx/store';
import * as MemberActions from './member.actions';
import { initialMembersState } from './member.state';

export const memberReducer = createReducer(
  initialMembersState,
  on(MemberActions.loadMembers, state => ({ ...state, loading: true })),
  on(MemberActions.loadMembersSuccess, (state, { members }) => ({ ...state, members, loading: false })),
  on(MemberActions.loadMembersFailure, (state, { error }) => ({ ...state, error, loading: false })),

  on(MemberActions.addMemberSuccess, (state, { member }) => ({ 
    ...state, 
    members: [...state.members, member] 
  })),
  on(MemberActions.updateMemberSuccess, (state, { member }) => ({
    ...state,
    members: state.members.map(m => m.id === member.id ? member : m)
  })),
  on(MemberActions.deleteMemberSuccess, (state, { id }) => ({
    ...state,
    members: state.members.filter(m => m.id !== id)
  }))
);
