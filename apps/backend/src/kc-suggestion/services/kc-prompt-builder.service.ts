import { Injectable } from "@nestjs/common";
import { SuggestionItemInput, PromptCandidateComponent } from "../interfaces/kc-suggestion.types";

type PromptBuildInput = {
  courseName: string;
  candidateComponents: PromptCandidateComponent[];
  items: SuggestionItemInput[];
  promptVersion: string;
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
      const description = component.description
        ? this.condense(component.description)
        : null;
      const domain = component.domainName ? ` • Domain: ${component.domainName}` : "";
      const level = component.level != null ? ` • Level: ${component.level}` : "";
      return `${index + 1}. ${component.slug} — ${component.name}${domain}${level}${
        description ? ` • ${description}` : ""
      }`;
    });

    const itemLines = params.items.map((item, index) => {
      const mcqIdPart = item.metadata?.mcqId ? ` [mcq_id=${item.metadata.mcqId}]` : "";
      const optionsText =
        item.options
          ?.map((option, optionIndex) => {
            const label = String.fromCharCode(65 + optionIndex);
            const normalizedOption = this.condense(option.content);
            const correctness = option.is_correct ? " ✓" : "";
            return `${label}) ${normalizedOption}${correctness}`;
          })
          .join(" | ") ?? "";

      const explanation = item.explanation ? this.condense(item.explanation) : "None";

      return [
        `Item ${index + 1}${mcqIdPart}`,
        `Stem: ${this.condense(item.stem)}`,
        `Options: ${optionsText}`,
        `Explanation: ${explanation}`,
      ].join("\n");
    });

    const systemPrompt = [
      `You are an expert curriculum designer matching medical MCQs to knowledge components.`,
      `Respect the candidate components list and pick the closest matches.`,
      `Base suggestions strictly on the provided course: ${normalizedCourseName}.`,
      `Prompt version: ${params.promptVersion}.`,
      `Respond in JSON only.`,
    ].join(" ");

    const userPrompt = [
      `Candidate knowledge components (${candidateCount}):`,
      candidateLines.join("\n"),
      ``,
      `Evaluate the following MCQ items and return matching knowledge component slugs with confidence scores.`,
      itemLines.join("\n\n"),
    ].join("\n");

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
}
