import { Member } from '../../shared/models/member.model';

export interface MembersState {
  members: Member[];
  loading: boolean;
  error:string | null;
}

export const initialMembersState: MembersState = {
  members: [],
  loading: false,
  error: null
};
