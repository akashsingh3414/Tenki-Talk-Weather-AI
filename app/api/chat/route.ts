import { type NextRequest, NextResponse } from "next/server"
import { AIService } from "@/lib/ai/core"
import { PromptManager } from "@/lib/ai/prompts"
import { buildMessages } from "@/lib/ai/request_builder"

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let language = "en-US";
  try {
    const body = await req.json()
    const { message, weatherData, history, duration = 1 } = body
    language = body.language || "en-US"

    if (!message && !weatherData) {
      return NextResponse.json({ error: "Message or Weather Data is required" }, { status: 400 })
    }

    const systemPrompt = PromptManager.getWeatherSystemPrompt(weatherData, language, duration, message)
    const messages = buildMessages(systemPrompt, history, message)

    // AIService handles all fallbacks internally — never throws
    const result = await AIService.generateTravelPlan(messages);

    console.log(`\nAI Response from: ${result.provider}`)

    const suggestions = result.object || {
      explanation: "I couldn't generate a travel plan. Please try again.",
      places: [],
    };

    return NextResponse.json({ suggestions, language, weatherData, provider: result.provider })

  } catch (error) {
    console.error("Unexpected API error:", error)
    return NextResponse.json({
      suggestions: {
        explanation: "Sorry, something went wrong. Please try again.",
        places: [],
      },
      language,
    })
  }
}
