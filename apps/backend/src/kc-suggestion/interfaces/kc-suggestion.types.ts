import { KnowledgeComponent } from "src/knowledge-component/entities/knowledge-component.entity";
import { SuggestedKnowledgeComponent } from "src/mcq/entities/mcq.entity";

export type SuggestionConfidenceLevel = "high" | "medium" | "low";

export type PromptCandidateComponent = Pick<
  KnowledgeComponent,
  "id" | "slug" | "name" | "description"
> & {
  domainName?: string;
  domainOrder?: number | null;
  level?: number | null;
};

export type SuggestionCandidateInput = {
  ids?: string[];
  slugs?: string[];
};

export type SuggestionItemInput = {
  stem: string;
  answer?: string | null;
  options: {
    content: string;
    is_correct?: boolean;
  }[];
  metadata?: {
    mcqId?: string;
    source?: string;
  };
  candidateComponentInput?: SuggestionCandidateInput;
};

export type SuggestionBatchRequest = {
  courseId: string;
  items: SuggestionItemInput[];
  targetedComponentInput?: SuggestionCandidateInput;
  initiatedBy?: {
    userId?: string;
    email?: string;
    name?: string;
  };
};

export type SuggestionResultItem = {
  mcqId?: string;
  stem: string;
  rationale?: string | null;
  confidence: SuggestionConfidenceLevel;
  confidenceScore: number;
  suggestions: SuggestedKnowledgeComponent[];
  modelScore?: number;
  generatedAt?: Date | string | null;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type SuggestionBatchResponse = {
  model: string;
  promptVersion: string;
  requestId: string;
  items: SuggestionResultItem[];
  raw?: unknown;
};
