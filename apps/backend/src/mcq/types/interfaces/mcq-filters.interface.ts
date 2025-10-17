import {
  McqApprovalStatus,
  McqDifficulty,
  McqTag,
  McqType,
  QuizType,
} from "src/mcq/dto/mcq.type";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

export interface McqFilters {
  question?: string;
  explanation?: string;
  exclude_ids?: string[];
  answer?: string;
  keywords?: string[];
  type?: McqType | McqType[];
  quiz_type?: QuizType;
  mcq_tags?: McqTag | McqTag[];
  difficulty?: McqDifficulty | McqDifficulty[];
  year_of_study?: YearOfStudy;
  in_clinical_case?: boolean;
  estimated_time_min?: number;
  estimated_time_max?: number;
  promo_min?: number;
  promo_max?: number;
  freelancer?: string;
  university?: string;
  faculty?: string;
  unit?: string;
  subject?: string;
  course?: string;
  clinical_case?: string;
  approval_status?: McqApprovalStatus | McqApprovalStatus[];
}
