
import { type NextRequest, NextResponse } from "next/server"
import { fetchWeatherData } from "@/lib/weather"

export async function POST(req: NextRequest) {
  try {
    const { city, language } = await req.json()

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 })
    }

    console.log(`[Weather API] Fetching data for city: ${city} (lang: ${language})`);
    const data = await fetchWeatherData(city, language)

    if (!data) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


