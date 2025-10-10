import { TrainingSessionStatus } from "../enums/training-session.enum";

export interface TrainingSessionFilters {
  title?: string;
  qcm?: boolean;
  qcs?: boolean;
  time_limit_min?: number;
  time_limit_max?: number;
  number_of_questions_min?: number;
  number_of_questions_max?: number;
  randomize_questions_order?: boolean;
  randomize_options_order?: boolean;
  status?: TrainingSessionStatus;
  scheduled_at?: Date;
  completed_at?: Date;
  user?: string;
  course?: string;
}
