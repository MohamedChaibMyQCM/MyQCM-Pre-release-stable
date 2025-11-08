import { Injectable } from "@nestjs/common";
import { SuggestionItemInput, PromptCandidateComponent } from "../interfaces/kc-suggestion.types";

type PromptBuildInput = {
  courseName: string;
  candidateComponents: PromptCandidateComponent[];
  items: SuggestionItemInput[];
  promptVersion: string;
  reuseContext?: boolean;
};

export type PromptBuildResult = {
  systemPrompt: string;
  userPrompt: string;
  metadata: {
    itemCount: number;
    candidateCount: number;
  };
};

@Injectable()
export class KcPromptBuilderService {
  buildPrompt(params: PromptBuildInput): PromptBuildResult {
    const normalizedCourseName = params.courseName?.trim() || "Unknown course";
    const candidateCount = params.candidateComponents.length;

    const candidateLines = params.candidateComponents.map((component, index) => {
      const kcId = component.slug || component.id;
      return `${index + 1}. KC_ID: ${kcId} • KC_NAME: ${component.name}`;
    });

    const itemLines = params.items.map((item, index) => {
      const mcqIdPart = item.metadata?.mcqId ? ` [mcq_id=${item.metadata.mcqId}]` : "";
      const optionLines =
        item.options.length > 0
          ? [
              "Options:",
              ...item.options.map((option, idx) => {
                const marker = String.fromCharCode(65 + idx);
                const correctness = option.is_correct ? " [correct]" : "";
                return `  ${marker}. ${this.condense(option.content)}${correctness}`;
              }),
            ].join("\n")
          : undefined;
      const derivedAnswer = this.formatAnswer(item);
      return [
        `Item ${index + 1}${mcqIdPart}`,
        `Question: ${this.condense(item.stem)}`,
        optionLines,
        derivedAnswer ? `Answer: ${derivedAnswer}` : undefined,
      ]
        .filter((segment): segment is string => Boolean(segment))
        .join("\n");
    });

    const systemPrompt = [
      `You are an expert curriculum designer matching medical MCQs to knowledge components.`,
      `Respect the candidate components list and pick the closest matches.`,
      `Base suggestions strictly on the provided course: ${normalizedCourseName}.`,
      `Prompt version: ${params.promptVersion}.`,
      `Respond in JSON only. Ensure the JSON is complete, strictly valid, and uses zero-based item indexes matching the order provided.`,
    ].join(" ");

    const userPromptParts = [];

    if (params.reuseContext) {
      userPromptParts.push(
        `Use the candidate knowledge component catalog provided earlier in this conversation.`,
      );
    } else {
      userPromptParts.push(`Candidate knowledge components (${candidateCount}):`);
      userPromptParts.push(candidateLines.join("\n"));
      userPromptParts.push("");
    }

    userPromptParts.push(
      `Evaluate the following MCQ items and return matching knowledge component slugs with confidence scores.`,
    );
    userPromptParts.push(itemLines.join("\n\n"));

    const userPrompt = userPromptParts.join("\n");

    return {
      systemPrompt,
      userPrompt,
      metadata: {
        itemCount: params.items.length,
        candidateCount,
      },
    };
  }

  private condense(value: string): string {
    return value.replace(/\s+/g, " ").trim();
  }

  private formatAnswer(item: SuggestionItemInput): string | undefined {
    if (item.answer) {
      return this.condense(item.answer);
    }
    const correctOptions = item.options
      .filter((option) => option.is_correct)
      .map((option) => this.condense(option.content));
    if (correctOptions.length > 0) {
      return correctOptions.join("; ");
    }
    return undefined;
  }
}
