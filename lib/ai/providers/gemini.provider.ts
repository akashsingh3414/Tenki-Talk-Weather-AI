import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../provider.interface";
import { WeatherData, Intent } from "../types";
import { PromptManager } from "../prompts";
import { cleanAIJson } from "../utils";

export interface SessionContext {
  city?: string;
  lastIntent?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey?: string, modelName: string = "gemini-2.5-flash") {
    const key = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
      throw new Error("Gemini API key is required");
    }
    this.client = new GoogleGenerativeAI(key);
    this.modelName = modelName;
  }

  getName(): string {
    return `Gemini (${this.modelName})`;
  }

  async identifyUserIntent(message: string, language: string): Promise<Intent[]> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const systemPrompt = PromptManager.getIntentPrompt(message, language);

    try {
      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      return cleanAIJson<Intent[]>(text);
    } catch (_e) {
      return [{ type: "general" }];
    }
  }

  async generateWeatherResponse(
    message: string,
    weatherData: WeatherData,
    language: string,
    _context: SessionContext,
    _targetDay?: Date,
    duration: number = 1
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const systemPrompt = PromptManager.getWeatherSystemPrompt(weatherData, language, duration, message);

    try {
      const result = await model.generateContent(systemPrompt);
      return result.response.text().trim();
    } catch (_err) {
      return PromptManager.getErrorResponse();
    }
  }

  async generateChatResponse(
    _message: string,
    language: string,
    _context: SessionContext
  ): Promise<string> {
    return PromptManager.getChatFallbackResponse(language);
  }
}
