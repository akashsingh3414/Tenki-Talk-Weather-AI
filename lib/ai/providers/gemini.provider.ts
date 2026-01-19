import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../provider.interface";
import { WeatherData, Forecast, IntentType, Intent } from "../types";

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

    const systemPrompt = `Analyze user message for weather-related intents. 
Possible intents in JSON array:
- {"type": "location_change", "location": "City Name"} (if city mentioned)
- {"type": "outing"} (planning/itinerary)
- {"type": "food"} (restaurants/dining)
- {"type": "forecast"} (hourly/daily)
- {"type": "general"} (advice like umbrella/clothing)

Message: "${message}"
Language: ${language}
Return ONLY JSON array of intents, e.g.,
[{"type":"location_change", "location": "Tokyo"}, {"type":"forecast"}]`;

    try {
      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonMatch = cleanText.match(/\[.*\]/s);
      return JSON.parse(jsonMatch ? jsonMatch[0] : "[]") as Intent[];
    } catch (e) {
      return [{ type: "general" as IntentType }];
    }
  }

  private formatForecast(forecast?: Forecast[], language?: string): string {
    return forecast
      ?.map(
        (f) =>
          `- ${new Date(f.time).toLocaleTimeString(language ?? "en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}: ${f.temp ?? "N/A"}°C, ${f.description ?? "N/A"}`
      )
      .join("\n") ?? "No forecast available.";
  }

  async generateWeatherResponse(
    message: string,
    weatherData: WeatherData,
    language: string,
    context: SessionContext,
    targetDay?: Date
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });

    // Format sunrise/sunset times
    const formatTime = (timestamp?: number) => {
      if (!timestamp) return "N/A"
      return new Date(timestamp * 1000).toLocaleTimeString(
        language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
        { hour: "2-digit", minute: "2-digit", hour12: false }
      )
    }

    const sunriseTime = formatTime(weatherData.current?.sunrise)
    const sunsetTime = formatTime(weatherData.current?.sunset)

    // Calculate visibility level
    const visibilityKm = weatherData.current?.visibility ? (weatherData.current.visibility / 1000).toFixed(1) : "N/A"
    const visibilityLevel = weatherData.current?.visibility
      ? (weatherData.current.visibility >= 10000 ? "Excellent"
        : weatherData.current.visibility >= 5000 ? "Good"
          : weatherData.current.visibility >= 2000 ? "Moderate"
            : "Poor")
      : "Unknown"

    // Detect category mentions in user message
    const lowerMessage = message.toLowerCase();
    const mentionsFood = /\b(food|restaurant|dining|eat|cuisine|dish|meal|cafe|street food)\b/i.test(message);
    const mentionsClothing = /\b(cloth|fashion|apparel|wear|boutique|textile|garment|shop|market)\b/i.test(message);
    const mentionsAgriculture = /\b(agri|farm|garden|crop|organic|nursery|plantation)\b/i.test(message);

    const hasCategoryMention = mentionsFood || mentionsClothing || mentionsAgriculture;

    let categoryGuidance = "";
    if (hasCategoryMention) {
      const categories = [];
      if (mentionsFood) categories.push("food/dining establishments, famous restaurants, local cuisine spots, street food markets");
      if (mentionsClothing) categories.push("clothing markets, fashion boutiques, textile shops, traditional garment stores");
      if (mentionsAgriculture) categories.push("agricultural sites, organic farms, nurseries, gardens, plantations");

      categoryGuidance = `
CATEGORY-SPECIFIC FOCUS DETECTED:
The user specifically mentioned: ${categories.join(" OR ")}.
PRIORITY: Recommend 5-6 places in ${weatherData.current?.city} that are FAMOUS for ${categories.join(" OR ")}.
Focus on well-known, authentic establishments or sites that locals and tourists actually visit for these categories.`;
    } else {
      categoryGuidance = `
GENERAL RECOMMENDATIONS:
Provide 5-6 FAMOUS places that ${weatherData.current?.city} is UNIQUELY KNOWN FOR.
Focus on iconic landmarks, cultural sites, natural attractions, and experiences that define this city's identity.`;
    }

    const systemPrompt = `
You are an expert travel and outing planner specialized in weather-aware itineraries.

CURRENT CITY: ${weatherData.current?.city}

DETAILED WEATHER CONTEXT:
- Temperature: ${weatherData.current?.temp}°C (Feels like: ${weatherData.current?.feels_like}°C)
- Conditions: ${weatherData.current?.description}
- Visibility: ${visibilityKm}km (${visibilityLevel})
- Humidity: ${weatherData.current?.humidity}%
- Wind Speed: ${weatherData.current?.wind_speed} m/s
- Cloud Cover: ${weatherData.current?.clouds}%
- Sunrise: ${sunriseTime} | Sunset: ${sunsetTime}
- Pressure: ${weatherData.current?.pressure} hPa

GOAL: Provide EXACTLY 5-6 recommendations for ${weatherData.current?.city} strictly based on the current weather conditions.
MANDATORY: You MUST provide AT LEAST 4 places and NO MORE THAN 6 places in your response.
${categoryGuidance}

CRITICAL: RECOMMEND PLACES THAT ${weatherData.current?.city} IS ACTUALLY FAMOUS FOR:
- Natural landmarks and scenic beauty the city is known for
- Historical monuments and heritage sites that define the city
- Cultural centers, museums, and traditional performances unique to the region
- Local cuisine, famous restaurants, and traditional dishes the city is renowned for
- Markets and handicrafts that showcase local artistry and culture
- Religious sites, temples, or spiritual places of significance
- Parks, gardens, lakes, or natural attractions the city is celebrated for
- Architectural marvels and iconic buildings that represent the city

DO NOT suggest generic places. Research and recommend REAL, FAMOUS attractions that tourists and locals actually visit in ${weatherData.current?.city}.

WEATHER-AWARE GUIDELINES:
- Low visibility (< 2km) or Fog → Suggest indoor activities, museums, cafes, or well-lit venues
- Sunrise/Sunset times → Recommend timing for outdoor activities (e.g., morning walks before ${sunsetTime})
- High humidity (> 70%) + High temp → Suggest water activities, air-conditioned venues, or light clothing
- Low temperature (< 10°C) → Recommend warm indoor spots, hot beverages, winter clothing
- Clear skies + Good visibility → Emphasize outdoor sightseeing, parks, viewpoints
- Rainy conditions → Indoor attractions, covered markets, umbrella recommendations

RULES:
1. FOCUS ONLY ON THE ALLOWED TOPICS. If the user asks something else, politely redirect them.
2. CITY SELECTION ENFORCEMENT: 
   - VERIFICATION: You MUST strictly compare any location mentioned in the "USER MESSAGE" with the "CURRENT CITY" (${weatherData.current?.city}). 
   - REDIRECTION: If the user is currently asking about, requesting weather for, or inquiring about places in ANY city other than ${weatherData.current?.city}, you MUST respond (in ${language}) with EXACTLY: "Simply change cities from the home page" and NOTHING ELSE.
   - RECOVERY: If the user returns to asking about the CURRENT CITY (${weatherData.current?.city}), ignore previous mismatches and provide your full weather-aware guidance immediately.
   - TRIGGER: This rule applies ONLY if the *current* user message contains a mismatch. If no other city is mentioned, proceed normally for ${weatherData.current?.city}.
3. RETURN ONLY A RAW JSON OBJECT. No markdown, no backticks, no preamble.
4. JSON STRUCTURE:
{
  "explanation": "A concise (3-4 sentence) weather-based context for these suggestions in ${language}. Mention what ${weatherData.current?.city} is famous for and how the current weather affects visiting these attractions. Reference specific weather conditions like visibility, temperature, or sunrise/sunset times when relevant. Use the native script and tone for ${language}.",
  "places": [
    {
      "name": "REAL NAME of a FAMOUS place in ${weatherData.current?.city} in ${language}",
      "description": "What this place is famous for and why it's significant to ${weatherData.current?.city} in ${language}.",
      "suitability": "Why this FAMOUS place is perfect for the current weather conditions in ${language}. Reference specific weather factors like visibility, temperature, or time of day.",
      "details": "Detailed travel info including: what makes this place special, historical/cultural significance, best time to visit, specific activities, approximate address or location area, and any special features in ${language}.",
      "imageSearchQuery": "3-4 keywords for an image search of this FAMOUS place (KEEP IN ENGLISH, use the actual place name)",
      "website": "Direct official website URL or a reliable tourism/information page URL (use real URLs when possible)",
      "mapsUrl": "Google Maps URL for the actual location (use real coordinates when possible)"
    }
  ]
}

EXAMPLES OF GOOD RECOMMENDATIONS:
- Delhi: India Gate, Red Fort, Qutub Minar, Lotus Temple, Chandni Chowk, Humayun's Tomb
- Agra: Taj Mahal, Agra Fort, Fatehpur Sikri
- Jaipur: Hawa Mahal, Amber Fort, City Palace, Jantar Mantar
- Mumbai: Gateway of India, Marine Drive, Elephanta Caves, Chhatrapati Shivaji Terminus
- Imphal: Kangla Fort, Loktak Lake, Ima Keithel (Mother's Market), Shree Govindajee Temple, War Cemetery

USER MESSAGE: "${message}"
Response:`;

    try {
      const result = await model.generateContent(systemPrompt);
      const text = result.response.text().trim();
      // Basic cleanup in case the model adds markdown block
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return cleanJson;
    } catch (err) {
      return JSON.stringify({
        explanation: "Sorry, I encountered an error creating your travel plans.",
        places: []
      });
    }
  }

  async generateChatResponse(
    message: string,
    language: string,
    context: SessionContext
  ): Promise<string> {
    // For this travel niche, we'll redirect to the structured response if city is set
    // Re-using the same structure for consistency
    return JSON.stringify({
      explanation: language === "ja-JP"
        ? "目的地を選択して、旅行プランを始めましょう。"
        : language === "hi-IN"
          ? "अपनी यात्रा की योजना शुरू करने के लिए कृपया एक गंतव्य चुनें।"
          : "Please select a destination to start planning your trip.",
      places: []
    });
  }
}
