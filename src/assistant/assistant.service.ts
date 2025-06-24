import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Mcq } from "src/mcq/entities/mcq.entity";
import { firstValueFrom } from "rxjs";
import { getEnvOrFatal } from "common/utils/env.util";

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly openaiApiKey: string;

  constructor(private readonly httpService: HttpService) {
    this.openaiApiKey = getEnvOrFatal("ASSISTANT_API_KEY");
  }

  async getAssistantResponseRatingAndFeedback(
    userResponse: string,
    mcq: Mcq,
  ): Promise<{ rating: number; feedback: string }> {
    if (userResponse.trim().toLowerCase() === mcq.answer.trim().toLowerCase()) {
      return { rating: 1, feedback: "Perfect! Your answer is correct." };
    }

    const url = "https://api.openai.com/v1/chat/completions";
    const prompt = `
      You are an AI assistant. Evaluate the user's response to the given question:
      - Rate the response on a scale of 0 to 1 based on correctness and relevance.
      - Provide constructive feedback on the user's response in French.
      
      Return your response as a JSON object with the following structure:
      {
        "rating": <number between 0 and 1>,
        "feedback": "<feedback text in French>"
      }
      
      Question: ${mcq.question}
      Correct answer: ${mcq.answer}
      User's answer: ${userResponse}
    `;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
            response_format: { type: "json_object" },
          },
          {
            headers: {
              Authorization: `Bearer ${this.openaiApiKey}`,
              "Content-Type": "application/json",
            },
          },
        ),
      );

      const messageContent =
        response.data?.choices?.[0]?.message?.content?.trim() ?? "";

      try {
        const parsedResponse = JSON.parse(messageContent);
        const rating = parsedResponse.rating ?? 0;
        const feedback = parsedResponse.feedback ?? "No feedback provided";

        if (isNaN(rating) || rating < 0 || rating > 1) {
          this.logger.error(`Invalid rating received: ${rating}`);
          return { rating: 0, feedback: "Unable to rate the response." };
        }

        return { rating: Number(rating.toFixed(2)), feedback };
      } catch (parseError) {
        this.logger.error(
          `Failed to parse JSON response: ${parseError.message}`,
        );
        return { rating: 0, feedback: "Unable to parse assistant response." };
      }
    } catch (error) {
      this.logger.error(
        `Error getting assistant response rating: ${error.message}`,
        error.stack,
      );
      return {
        rating: 0,
        feedback:
          "An error occurred while generating feedback. Please try again later.",
      };
    }
  }
}
