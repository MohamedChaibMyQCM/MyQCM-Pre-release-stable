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
  responseId: string;
  previousResponseId?: string | null;
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
  previousResponseId?: string | null;
};

@Injectable()
export class KcSuggestionLlmService {
  private readonly logger = new Logger(KcSuggestionLlmService.name);
  private readonly openAiClient: OpenAI;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly temperature?: number;
  private readonly maxOutputTokens: number;

  constructor() {
    const apiKey = getEnvOrFatal<string>("ASSISTANT_API_KEY");
    this.model = process.env.KC_SUGGESTION_MODEL || "gpt-5-mini-2025-08-07";
    this.maxRetries = Number(process.env.KC_SUGGESTION_MAX_RETRIES || 2);
    this.timeoutMs = Number(process.env.KC_SUGGESTION_TIMEOUT_MS || 45000);
    // Includes reasoning tokens per OpenAI Responses API docs, so keep generous headroom
    this.maxOutputTokens = Number(process.env.KC_SUGGESTION_MAX_OUTPUT || 3200);
    const temperatureEnv = process.env.KC_SUGGESTION_TEMPERATURE;
    this.temperature =
      temperatureEnv !== undefined && temperatureEnv !== ""
        ? Number(temperatureEnv)
        : undefined;

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

        const requestPayload = {
          model: this.model,
          max_output_tokens: this.maxOutputTokens,
          previous_response_id: params.previousResponseId ?? undefined,
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
            text: {
              format: {
                type: "json_schema",
                name: params.responseSchema.name,
                strict: params.responseSchema.strict ?? true,
                schema: params.responseSchema.schema,
              },
            },
          ...(typeof this.temperature === "number" && !Number.isNaN(this.temperature)
            ? { temperature: this.temperature }
            : {}),
        };

        const response = await this.openAiClient.responses.create(
          requestPayload as any,
          { signal: controller.signal },
        );

        if (timeoutRef) {
          clearTimeout(timeoutRef);
        }

        const rawText = this.extractOutputText(response);

        if (!rawText) {
          throw new Error("Model returned empty response");
        }

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
          responseId: response.id,
          previousResponseId: params.previousResponseId,
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

  private extractOutputText(response: unknown): string {
    const data = response as {
      output_text?: unknown;
      output?: Array<{ content?: unknown[] }>;
      content?: unknown;
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    const direct = this.normalizeContent(data?.output_text);
    if (direct) {
      return direct;
    }

    const fromOutput =
      data?.output
        ?.flatMap((item) => item?.content ?? [])
        .map((content) => this.normalizeContent(content))
        .find((text) => text) ?? "";
    if (fromOutput) {
      return fromOutput;
    }

    const fallbacks = [
      data?.content,
      data?.choices?.[0]?.message?.content,
    ];

    for (const candidate of fallbacks) {
      const text = this.normalizeContent(candidate);
      if (text) {
        return text;
      }
    }

    return "";
  }

  private normalizeContent(value: unknown): string {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value
        .map((entry) => this.normalizeContent(entry))
        .filter(Boolean)
        .join("\n")
        .trim();
    }

    if (typeof value === "object") {
      const candidate =
        (value as { text?: unknown; output_text?: unknown }).text ??
        (value as { text?: unknown; output_text?: unknown }).output_text;
      if (typeof candidate === "string") {
        return candidate.trim();
      }
    }

    return "";
  }
}
