import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { getEnvOrFatal } from "common/utils/env.util";
import { firstValueFrom } from "rxjs";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import type { AxiosError } from "axios";
import { GenerationItemType } from "./enums/generation-item-type.enum";

type GenerateParams = {
  mcqCount: number;
  qrocCount: number;
  difficulty: string;
  courseName: string;
  yearOfStudy: string;
  unitName?: string | null;
  subjectName?: string | null;
  openAiFileId: string;
};

type GeneratedItem = {
  type: GenerationItemType;
  stem: string;
  options?: { content: string; is_correct: boolean }[];
  expected_answer?: string | null;
};

type SourceFileParams = {
  filePath: string;
  originalName: string;
};

// Raw model output before mapping to enum
type RawItem = {
  type: "MCQ" | "QROC";
  stem: string;
  // both are present per schema; for QROC options is typically []
  options: { content: string; is_correct: boolean }[];
  // for MCQ expected_answer can be ""
  expected_answer: string;
};

const RAW_TO_ENUM: Record<RawItem["type"], GenerationItemType> = {
  MCQ: GenerationItemType.MCQ,
  QROC: GenerationItemType.QROC,
};

@Injectable()
export class GenerationAiService {
  private readonly logger = new Logger(GenerationAiService.name);
  private readonly openaiApiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly openAiClient: OpenAI;

  constructor(private readonly httpService: HttpService) {
    this.openaiApiKey = getEnvOrFatal("ASSISTANT_API_KEY");
    this.model = process.env.GENERATION_MODEL || "gpt-4o-mini";
    this.baseUrl = process.env.ASSISTANT_BASE_URL || "https://api.openai.com/v1";
    this.openAiClient = new OpenAI({
      apiKey: this.openaiApiKey,
      baseURL: this.baseUrl,
    });
  }

  async uploadSourceFile(params: SourceFileParams): Promise<string> {
    const absolutePath = this.ensureLocalFilePath(params.filePath);
    let stream: fs.ReadStream | null = null;

    try {
      stream = fs.createReadStream(absolutePath);
      const uploaded = await this.openAiClient.files.create({
        file: stream as any,
        purpose: "assistants", // valid with Responses + input_file
      });

      if (!uploaded?.id) throw new Error("Failed to upload source document to OpenAI");
      return uploaded.id;
    } catch (error) {
      const axiosError = error as AxiosError;
      const details =
        axiosError.response?.data ??
        axiosError.message ??
        (error instanceof Error ? error.message : "Unknown error");
      this.logger.error(
        `Failed to upload source document to OpenAI: ${JSON.stringify(details)}`
      );
      throw new Error("Failed to upload source document to OpenAI");
    } finally {
      if (stream) stream.close();
    }
  }

  private ensureLocalFilePath(filePath: string) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) throw new Error("Source file not found on disk");
    return absolutePath;
  }

  async generateItemsFromSource(params: GenerateParams): Promise<GeneratedItem[]> {
    const { mcqCount, qrocCount, difficulty, courseName, yearOfStudy } = params;

    const instructions = `
Tu es un enseignant-chercheur en médecine. À partir du document joint, génère des questions en français pour le niveau indiqué.
Contraintes:
- MCQ total: ${mcqCount}
- QROC total: ${qrocCount}
- Cours: ${courseName}
- Année: ${yearOfStudy}
- Difficulté: ${difficulty}
${params.unitName ? `- Unité: ${params.unitName}` : ""}
${params.subjectName ? `- Module: ${params.subjectName}` : ""}
Règles de sortie:
- Les MCQ ont exactement 4 options uniques, 1 seule correcte.
- Les QROC ont une réponse courte attendue.
- Respecte strictement le schéma JSON. Aucun champ supplémentaire.
`.trim();

    // OpenAI’s structured outputs validator (with strict) wants every property listed in `required`.
    // So we require: type, stem, options, expected_answer.
    // Then we enforce MCQ/QROC semantics AFTER parsing.
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["MCQ", "QROC"] },
              stem: { type: "string" },
              options: {
                type: "array",
                minItems: 0,          // allow [] for QROC
                maxItems: 4,          // MCQ must be 4; we’ll enforce exactly 4 post-parse
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    content: { type: "string" },
                    is_correct: { type: "boolean" },
                  },
                  required: ["content", "is_correct"],
                },
              },
              expected_answer: { type: "string" }, // allow "" for MCQ
            },
            required: ["type", "stem", "options", "expected_answer"],
          },
        },
      },
      required: ["items"],
    };

    const body = {
      model: this.model,
      instructions: "You generate medical exam questions formatted exactly as requested.",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: instructions },
            { type: "input_file", file_id: params.openAiFileId },
          ],
        },
      ],
      temperature: 0.6,
      text: {
        format: {
          type: "json_schema",
          name: "generation_items",
          schema,
          strict: true,
        },
      },
    };

    let response;
    try {
      response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/responses`, body, {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 240000,
        })
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? "unknown";
      const data = axiosError.response?.data;
      this.logger.error(
        `OpenAI response request failed (status: ${status}): ${JSON.stringify(
          data ?? axiosError.message
        )}`
      );
      throw new Error("OpenAI failed to generate items");
    }

    const data = response.data ?? {};
    // Structured outputs: JSON string at output_text
    const rawString: string =
      typeof data.output_text === "string"
        ? data.output_text
        : data.output?.[0]?.content?.[0]?.text ??
          data.content ??
          data.choices?.[0]?.message?.content ??
          "";

    if (!rawString || typeof rawString !== "string") {
      this.logger.error(`Unexpected OpenAI response shape: ${JSON.stringify(data)}`);
      throw new Error("AI responded without content");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawString);
    } catch (e) {
      this.logger.error(`Failed to parse OpenAI response: ${(e as Error).message}`);
      throw new Error("Unable to parse AI response");
    }

    const rawItems: RawItem[] = Array.isArray(parsed?.items) ? parsed.items : [];
    if (!rawItems.length) throw new Error("AI responded without generated items");

    // Post-parse validation enforcing semantics the schema can’t encode here
    const isValidMcq = (it: RawItem) =>
      it.type === "MCQ" &&
      Array.isArray(it.options) &&
      it.options.length === 4 &&
      it.options.every(
        (o) =>
          o &&
          typeof o.content === "string" &&
          o.content.trim().length > 0 &&
          typeof o.is_correct === "boolean"
      ) &&
      it.options.filter((o) => o.is_correct).length === 1;

    const isValidQroc = (it: RawItem) =>
      it.type === "QROC" &&
      Array.isArray(it.options) &&
      it.options.length === 0 && // QROC must have no options
      typeof it.expected_answer === "string" &&
      it.expected_answer.trim().length > 0;

    const mcqsRaw = rawItems.filter((i) => i.type === "MCQ").slice(0, params.mcqCount);
    const qrocsRaw = rawItems.filter((i) => i.type === "QROC").slice(0, params.qrocCount);

    const normalizeOption = (opt: any) => ({
      content: (opt?.content ?? "").toString().trim(),
      is_correct: Boolean(opt?.is_correct),
    });

    const mapOne = (item: RawItem): GeneratedItem => ({
      type: RAW_TO_ENUM[item.type],
      stem: (item.stem ?? "").toString().trim(),
      options: Array.isArray(item.options) ? item.options.map(normalizeOption) : undefined,
      expected_answer:
        typeof item.expected_answer === "string"
          ? item.expected_answer.trim()
          : item.expected_answer ?? null,
    });

    const mappedMcqs = mcqsRaw.filter(isValidMcq).map(mapOne);
    const mappedQrocs = qrocsRaw.filter(isValidQroc).map(mapOne);

    const result: GeneratedItem[] = [...mappedMcqs, ...mappedQrocs];
    if (!result.length) {
      this.logger.error(
        `Model output failed validation: ${JSON.stringify(rawItems).slice(0, 1500)}…`
      );
      throw new Error("AI responded without valid generated items after validation");
    }

    return result;
  }
}
