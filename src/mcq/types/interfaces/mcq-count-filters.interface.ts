export interface McqCountBySingleFiltersInterface {
  unit?: string;
  course?: string;
  subject?: string;
  faculty?: string;
  university?: string;
  clinical_case?: string;
}

export interface McqCountByMultipleFiltersInterface {
  units?: string[];
  courses?: string[];
  subjects?: string[];
  faculties?: string[];
  universities?: string[];
  clinical_cases?: string[];
}
