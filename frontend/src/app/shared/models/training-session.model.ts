import { Trainer } from "./trainer.model";
import { Member } from "./member.model";

export interface SessionRegistration {
  id: number;
  registeredAt: string;
  member: Member;
}

export interface TrainingSession {
  id: number;
  date: string;
  time: string;
  type: string;
  maxParticipants: number;
  trainer: Trainer;
  registrations?: SessionRegistration[];
  createdAt?: string;
}
