import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { SubjectSemestre } from "../dto/subject.type";

export interface SubjectFilters {
  name?: string;
  description?: string;
  year_of_study?: YearOfStudy;
  subject_semestre?: SubjectSemestre;
  unit?: string;
  has_icon?: boolean;
  has_banner?: boolean;
}
