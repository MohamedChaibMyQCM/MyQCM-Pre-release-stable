import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

export interface UnitFilters {
  name?: string;
  description?: string;
  year_of_study?: YearOfStudy;
}
