export type SelectOption = {
  id: string;
  name: string;
};

export type KnowledgeComponentRow = {
  id: string;
  slug: string;
  name: string;
  code?: string | null;
  description?: string | null;
  level?: number | null;
  isActive: boolean;
  domain?: SelectOption | null;
  parent?: SelectOption | null;
};

export type FormState = {
  id?: string;
  slug: string;
  name: string;
  code?: string;
  description?: string;
  domainId: string;
  courseId: string;
  parentId?: string;
  level?: number | "";
  isActive: boolean;
};

export type AiReviewConfidence = "high" | "medium" | "low";

export type AiReviewSuggestion = {
  id: string;
  slug: string;
  name?: string;
  score: number;
  rationale?: string | null;
};

export type AiReviewItem = {
  mcqId: string;
  stem: string;
  rationale?: string | null;
  confidence: AiReviewConfidence;
  confidenceScore: number;
  suggestions: AiReviewSuggestion[];
  generatedAt?: string | null;
};

export type AiReviewResponse = {
  items: AiReviewItem[];
  requestIds: string[];
  processed: number;
  requested: number;
  skipped: number;
  optionsSkipped: number;
  tokens: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type AiSessionLog = {
  id: string;
  createdAt: string;
  requested: number;
  processed: number;
  skipped: number;
  optionsSkipped: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  initiatedBy?: {
    userId?: string;
    name?: string;
    email?: string;
  } | null;
};
