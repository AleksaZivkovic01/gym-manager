import { Trainer } from "../../shared/models/trainer.model";

export interface TrainerState {
  trainers: Trainer[];
  loading: boolean;
  error:string | null;
}

export const initialTrainerState: TrainerState = {
  trainers: [],
  loading: false,
  error: null
};