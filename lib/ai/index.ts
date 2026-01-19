import { AIProviderFactory } from "./factory";
import { SessionContext } from "./provider.interface";
import { WeatherData, Intent } from "./types";

const provider = AIProviderFactory.createFromEnv();

export async function identifyUserIntent(message: string, language: string): Promise<Intent[]> {
    return provider.identifyUserIntent(message, language);
}

export async function generateWeatherResponse(
    message: string,
    weatherData: WeatherData,
    language: string,
    context: SessionContext
): Promise<string> {
    return provider.generateWeatherResponse(
        message,
        weatherData,
        language,
        context
    );
}

export async function generateChatResponse(
    message: string,
    language: string,
    context: SessionContext
): Promise<string> {
    return provider.generateChatResponse(message, language, context);
}

export * from "./types";
export * from "./provider.interface";
export * from "./factory";
export { GeminiProvider } from "./providers/gemini.provider";
export { HuggingFaceProvider } from "./providers/huggingface.provider";