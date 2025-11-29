import { Member } from "./member.model";
import { Trainer } from "./trainer.model";

export interface TrainingSession {
  id: number;
  date: string;
  time: string;
  type: string;
  member:Member;
  trainer:Trainer;

}
