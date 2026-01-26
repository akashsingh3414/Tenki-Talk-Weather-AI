import { type NextRequest, NextResponse } from "next/server"
import { executeWithFallback, parseAIResponse } from "@/lib/api/ai"

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      city,
      weatherData,
      language,
      history,
      duration = 1,
    } = await req.json()

    if (!message && !weatherData) {
      return NextResponse.json(
        { error: "Message or Weather Data is required" },
        { status: 400 }
      )
    }

    const context = {
      city: city || weatherData?.current?.city,
      history: history,
    }

    const { result: aiResponse, provider } = await executeWithFallback(
      (prov) => {
        if (weatherData) {
          return prov.generateWeatherResponse(message, weatherData, language, context, undefined, duration)
        } else {
          return prov.generateChatResponse(message, language, context)
        }
      }
    )

    const finalSuggestions = parseAIResponse(aiResponse)

    return NextResponse.json({
      suggestions: finalSuggestions,
      language,
      weatherData,
      provider
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}
