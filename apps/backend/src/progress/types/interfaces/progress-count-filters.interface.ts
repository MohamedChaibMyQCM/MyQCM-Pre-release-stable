export interface ProgressCountBySingleFiltersInterface {
  unit?: string;
  course?: string;
  subject?: string;
  mcq?: string;
  user?: string;
}

export interface ProgressCountByMultiFilterInterface {
  units?: string[];
  courses?: string[];
  subjects?: string[];
  mcqs?: string[];
  user?: string;
}
