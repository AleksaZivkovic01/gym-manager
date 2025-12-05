import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Member } from '../../../shared/models/member.model';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
   private apiUrl = 'http://localhost:3000/members';

  constructor(private http: HttpClient) {}

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
  }

  getMember(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  getMyMember(): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/me`);
  }

  addMember(member: Member): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member);
  }

  updateMember(id: number, member: Member): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member);
  }

  deleteMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
