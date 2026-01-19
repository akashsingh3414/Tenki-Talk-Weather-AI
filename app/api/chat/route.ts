import { type NextRequest, NextResponse } from "next/server";
import { AIProvider } from "@/lib/ai/provider.interface";
import { HuggingFaceProvider } from "@/lib/ai/providers/huggingface.provider";
import { GeminiProvider } from "@/lib/ai/providers/gemini.provider";
import { fetchWeatherData } from "@/lib/weather";
import type { WeatherData } from "@/lib/ai/types";

function getAvailableProviders(): AIProvider[] {
  const available: AIProvider[] = [];
  try {
    available.push(new HuggingFaceProvider());
  } catch (e) { }
  try {
    available.push(new GeminiProvider());
  } catch (e) { }
  return available;
}

const providers = getAvailableProviders();

async function executeWithFallback<T>(
  operation: (provider: AIProvider) => Promise<T>
): Promise<{ result: T; provider: string }> {
  const errors: Error[] = [];

  for (const provider of providers) {
    try {
      const result = await operation(provider);
      return { result, provider: provider.getName() };
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[AI Fallback] Provider "${provider.getName()}" failed: ${errorMsg}`);
      errors.push(error instanceof Error ? error : new Error(String(error)));
      continue;
    }
  }

  throw new Error(
    `All AI providers failed. Errors: ${errors.map(e => e.message).join(", ")}`
  );
}

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      city,
      countryCode,
      weatherData,
      language,
      history,
    } = await req.json();

    if (!message && !weatherData) {
      return NextResponse.json(
        { error: "Message or Weather Data is required" },
        { status: 400 }
      );
    }

    const context = {
      city: city || weatherData?.current?.city,
      history: history,
    };

    const { result: aiResponse, provider } = await executeWithFallback(
      (prov) => {
        if (weatherData) {
          return prov.generateWeatherResponse(message, weatherData, language, context);
        } else {
          return prov.generateChatResponse(message, language, context);
        }
      }
    );

    console.log(`[Chat API] Provider: ${provider}`);
    console.log(`[Chat API] Response length: ${aiResponse.length} characters`);
    console.log(`[Chat API] First 200 chars: ${aiResponse.substring(0, 200)}`);
    console.log(`[Chat API] Last 200 chars: ${aiResponse.substring(Math.max(0, aiResponse.length - 200))}`);

    let finalSuggestions: any = aiResponse;
    try {
      // Robust JSON extraction: Handle markdown code blocks or raw strings
      let cleanResponse = aiResponse.trim();

      // Remove markdown code blocks if present
      if (cleanResponse.includes("```")) {
        const match = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          cleanResponse = match[1].trim();
        }
      }

      if (cleanResponse.startsWith("{") || cleanResponse.startsWith("[")) {
        finalSuggestions = JSON.parse(cleanResponse);
        console.log(`[Chat API] Successfully parsed JSON with ${finalSuggestions.places?.length || 0} places`);
      }
    } catch (e) {
      console.error("[Chat API] Failed to parse AI Response as JSON:", e);
      console.error("[Chat API] Problematic response:", aiResponse);

      // Try to extract partial JSON if response was truncated
      const jsonMatch = aiResponse.match(/\{[\s\S]*$/);
      if (jsonMatch) {
        try {
          // Attempt to fix truncated JSON by adding closing braces
          let partialJson = jsonMatch[0];
          const openBraces = (partialJson.match(/\{/g) || []).length;
          const closeBraces = (partialJson.match(/\}/g) || []).length;
          const openBrackets = (partialJson.match(/\[/g) || []).length;
          const closeBrackets = (partialJson.match(/\]/g) || []).length;

          // Add missing closing brackets/braces
          for (let i = 0; i < openBrackets - closeBrackets; i++) partialJson += "]";
          for (let i = 0; i < openBraces - closeBraces; i++) partialJson += "}";

          finalSuggestions = JSON.parse(partialJson);
          console.log("[Chat API] Recovered from truncated JSON");
        } catch (fixError) {
          console.error("[Chat API] Could not fix truncated JSON:", fixError);
          finalSuggestions = aiResponse;
        }
      } else {
        finalSuggestions = aiResponse;
      }
    }

    return NextResponse.json({
      suggestions: finalSuggestions,
      language,
      weatherData,
      provider
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
