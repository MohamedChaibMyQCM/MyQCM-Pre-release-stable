import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { getEnvOrFatal } from "common/utils/env.util";
import { randomUUID } from "crypto";
import { PromptBuildResult } from "./kc-prompt-builder.service";

export type LlmInvocationResult = {
  rawText: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  response: unknown;
};

type InvokeParams = {
  prompt: PromptBuildResult;
  responseSchema: {
    name: string;
    schema: Record<string, unknown>;
    strict?: boolean;
  };
  requestId?: string;
};

@Injectable()
export class KcSuggestionLlmService {
  private readonly logger = new Logger(KcSuggestionLlmService.name);
  private readonly openAiClient: OpenAI;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly temperature: number;

  constructor() {
    const apiKey = getEnvOrFatal<string>("ASSISTANT_API_KEY");
    this.model = process.env.KC_SUGGESTION_MODEL || "gpt-5-mini-2025-08-07";
    this.maxRetries = Number(process.env.KC_SUGGESTION_MAX_RETRIES || 2);
    this.timeoutMs = Number(process.env.KC_SUGGESTION_TIMEOUT_MS || 45000);
    this.temperature = Number(process.env.KC_SUGGESTION_TEMPERATURE || 0.1);

    this.openAiClient = new OpenAI({
      apiKey,
      baseURL: process.env.ASSISTANT_BASE_URL || "https://api.openai.com/v1",
    });
  }

  async invoke(params: InvokeParams): Promise<LlmInvocationResult> {
    const requestId = params.requestId ?? randomUUID();
    const sanitizedPrompt = this.sanitizeForLog(
      `${params.prompt.systemPrompt}\n---\n${params.prompt.userPrompt}`,
    );
    this.logger.debug(`[${requestId}] Invoking KC suggestion model with prompt:
${sanitizedPrompt}`);

    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      let timeoutRef: NodeJS.Timeout | null = null;
      try {
        const controller = new AbortController();
        timeoutRef = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await this.openAiClient.responses.create(
          {
            model: this.model,
            temperature: this.temperature,
            max_output_tokens: Number(process.env.KC_SUGGESTION_MAX_OUTPUT || 1200),
            input: [
              {
                role: "system",
                content: [{ type: "input_text", text: params.prompt.systemPrompt }],
              },
              {
                role: "user",
                content: [{ type: "input_text", text: params.prompt.userPrompt }],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: params.responseSchema.name,
                schema: params.responseSchema.schema,
                strict: params.responseSchema.strict ?? true,
              },
            },
          } as any,
          { signal: controller.signal },
        );

        if (timeoutRef) {
          clearTimeout(timeoutRef);
        }

        const rawText = response.output_text;

        const usage = response.usage ?? {
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
        };

        const sanitizedResponse = this.sanitizeForLog(
          JSON.stringify({
            output: rawText,
            usage,
          }),
        );
        this.logger.debug(`[${requestId}] Model response: ${sanitizedResponse}`);

        return {
          rawText,
          model: response.model ?? this.model,
          usage: {
            promptTokens: usage.input_tokens ?? 0,
            completionTokens: usage.output_tokens ?? 0,
            totalTokens: usage.total_tokens ?? 0,
          },
          response,
        };
      } catch (error) {
        if (timeoutRef) {
          clearTimeout(timeoutRef);
        }
        lastError = error;
        const message =
          error instanceof Error ? error.message : JSON.stringify(error);
        this.logger.warn(
          `[${requestId}] KC suggestion model call failed (attempt ${attempt}/${this.maxRetries}): ${message}`,
        );

        if (attempt === this.maxRetries) {
          break;
        }

        await this.delay(250 * attempt);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("KC suggestion model invocation failed");
  }

  private sanitizeForLog(value: string): string {
    return value
      .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
      .replace(/\b\d{6,}\b/g, "[redacted-number]");
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
