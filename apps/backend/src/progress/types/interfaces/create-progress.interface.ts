import { SelectedOptionInterface } from "./selected-option.interface";

export class CreateProgressInterface {
  mcq: string;
  unit: string;
  course: string;
  subject: string;
  session?: string;
  response?: string;
  gained_xp?: number;
  time_spent?: number;
  selected_options?: SelectedOptionInterface[];
  success_ratio?: number;
  feedback?: string;
  knowledge_components?: string[];
}
