import { Timestamp } from 'firebase/firestore';

export interface SetRecord {
  reps: string;
  weight: string;
  completed: boolean;
  rpe?: string;
  quality?: 'Ottima' | 'Buona' | 'Meh';
}

export interface WorkoutLog {
  [exerciseId: string]: {
    sets: SetRecord[];
    notes: string;
  };
}
