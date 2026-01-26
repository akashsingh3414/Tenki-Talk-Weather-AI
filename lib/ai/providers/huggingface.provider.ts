import { AIProvider } from "../provider.interface";
import { WeatherData, Intent } from "../types";
import { PromptManager } from "../prompts";
import { cleanAIJson } from "../utils";

export interface SessionContext {
    city?: string;
    lastIntent?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export class HuggingFaceProvider implements AIProvider {
    private apiKey: string;
    private modelId: string;
    private baseUrl = "https://router.huggingface.co/v1/chat/completions";

    constructor(apiKey?: string, modelId: string = "meta-llama/Llama-3.2-3B-Instruct") {
        const key = apiKey || process.env.HUGGINGFACE_API_KEY;
        if (!key) throw new Error("HuggingFace API key is required");
        this.apiKey = key;
        this.modelId = modelId;
    }

    getName(): string {
        return `HuggingFace (${this.modelId})`;
    }

    private async generateCompletion(messages: { role: string; content: string }[]): Promise<string> {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.modelId,
                messages,
                max_tokens: 3072,
                temperature: 0.7,
                top_p: 0.9,
                stream: false,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`HuggingFace API error: ${err}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
    }

    async identifyUserIntent(message: string, language: string): Promise<Intent[]> {
        const systemPrompt = PromptManager.getIntentPrompt(message, language);
        try {
            const text = await this.generateCompletion([
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ]);
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
        const systemPrompt = PromptManager.getWeatherSystemPrompt(weatherData, language, duration, message);

        try {
            const result = await this.generateCompletion([
                { role: "system", content: systemPrompt },
                { role: "user", content: message || "Give me travel plans" },
            ]);
            return result.trim();
        } catch (_err) {
            return PromptManager.getErrorResponse();
        }
    }

    async generateChatResponse(_message: string, language: string, _context: SessionContext): Promise<string> {
        return PromptManager.getChatFallbackResponse(language);
    }
}
