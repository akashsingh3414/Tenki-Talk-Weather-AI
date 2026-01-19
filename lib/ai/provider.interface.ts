import { Intent, WeatherData } from "./types";

export interface SessionContext {
    city?: string;
    lastIntent?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    lastResponseSummary?: string;
    lastQueryTime?: number;
}

export interface AIProvider {
    identifyUserIntent(message: string, language: string): Promise<Intent[]>;

    generateWeatherResponse(
        message: string,
        weatherData: WeatherData,
        language: string,
        context: SessionContext,
        targetDay?: Date
    ): Promise<string>;

    generateChatResponse(
        message: string,
        language: string,
        context: SessionContext
    ): Promise<string>;

    getName(): string;
}
