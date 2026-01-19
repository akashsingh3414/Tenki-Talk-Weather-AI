import { AIProvider } from "./provider.interface";
import { GeminiProvider } from "./providers/gemini.provider";
import { HuggingFaceProvider } from "./providers/huggingface.provider";

export type AIProviderType = "gemini" | "huggingface";

export class AIProviderFactory {
    static create(
        type: AIProviderType,
        apiKey?: string,
        modelId?: string
    ): AIProvider {
        switch (type) {
            case "gemini":
                return new GeminiProvider(apiKey, modelId);
            case "huggingface":
                return new HuggingFaceProvider(apiKey, modelId);
            default:
                throw new Error(`Unknown AI provider type: ${type}`);
        }
    }

    static createFromEnv(): AIProvider {
        const providerType = (process.env.AI_PROVIDER as AIProviderType) || "gemini";
        return AIProviderFactory.create(providerType);
    }
}