export type PrototypeOptionDto = {
  id: string;
  content: string;
  is_correct: boolean;
};

export type PrototypeMcqDto = {
  id: string;
  question: string;
  type: string;
  estimated_time: number;
  difficulty: string;
  quiz_type: string;
  options: PrototypeOptionDto[];
  answer?: string | null;
  explanation?: string | null;
};

export type PrototypeClinicalCaseDto = {
  id: string;
  title: string;
  description: string;
  scenario: string;
  objectives: string[];
  tags: string[];
  author: string;
  faculty_type: string;
  year_of_study: string;
  promo?: number | null;
  mcqs: PrototypeMcqDto[];
};

export type PrototypeClinicalCaseSubmissionResult = {
  success_ratio: number;
  selected_options: { id: string; is_correct: boolean }[];
  correct_options: { id: string; is_correct: boolean }[];
  options: PrototypeOptionDto[];
  explanation: string | null;
  question: string;
  response: string | null;
  answer: string | null;
};
