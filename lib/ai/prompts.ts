import { WeatherData, Forecast } from "./types";

export class PromptManager {
    static getIntentPrompt(message: string, language: string): string {
        return `Analyze user message for weather-related intents. 
Possible intents in JSON array:
- {"type": "location_change", "location": "City Name"} (ONLY if the user explicitly wants to switch to or see information FOR this city, NOT if mentioned as personal context like "I am from India")
- {"type": "outing"} (planning/itinerary)
- {"type": "food"} (restaurants/dining)
- {"type": "forecast"} (hourly/daily)
- {"type": "general"} (advice like umbrella/clothing)

Message: "${message}"
Language: ${language}
Return ONLY JSON array of intents, e.g.,
[{"type":"location_change", "location": "Tokyo"}, {"type":"forecast"}]`;
    }

    private static formatTime(timestamp: number | undefined, language: string): string {
        if (!timestamp) return "N/A";
        return new Date(timestamp * 1000).toLocaleTimeString(
            language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
            { hour: "2-digit", minute: "2-digit", hour12: false }
        );
    }

    private static getForecastSummary(weatherData: WeatherData, duration: number): string {
        if (duration <= 0 || !weatherData.forecast || weatherData.forecast.length === 0) {
            return "";
        }

        const days: Record<string, Forecast[]> = {};
        weatherData.forecast.forEach(item => {
            const date = item.time.split(" ")[0];
            if (!days[date]) days[date] = [];
            days[date].push(item);
        });

        const sortedDates = Object.keys(days).sort().slice(0, duration);

        const summary = sortedDates.map(date => {
            const dayItems = days[date];

            const findItemAtHour = (targetHour: number) => {
                return dayItems.find(item => {
                    const hour = parseInt(item.time.split(" ")[1].split(":")[0]);
                    return Math.abs(hour - targetHour) <= 1;
                });
            };

            const dayItem = findItemAtHour(12) || dayItems[Math.floor(dayItems.length / 2)];
            const eveningItem = findItemAtHour(18);
            const nightItem = findItemAtHour(21) || dayItems[dayItems.length - 1];

            const points = [
                { label: "Day", item: dayItem },
                { label: "Evening", item: eveningItem },
                { label: "Night", item: nightItem }
            ].filter(p => p.item);

            const uniquePoints = points.filter((p, index, self) =>
                index === self.findIndex((t) => (t.item?.time === p.item?.time))
            );

            const details = uniquePoints.map(p => {
                const i = p.item!;
                return `${p.label}: ${Math.round(i.temp)}°C (${i.description})`;
            }).join(" | ");

            return `- ${date}: ${details}`;
        }).join("\n");

        return `\nFORECAST CONTEXT (3 KEY POINTS/DAY FOR ${duration} DAYS):\n${summary}\n`;
    }

    private static getCategoryGuidance(message: string, city: string, duration: number): string {
        const mentionsFood = /\b(food|restaurant|dining|eat|cuisine|dish|meal|cafe|street food)\b/i.test(message);
        const mentionsClothing = /\b(cloth|fashion|apparel|wear|boutique|textile|garment|shop|market|mall|retail)\b/i.test(message);
        const mentionsAgriculture = /\b(agri|farm|garden|crop|organic|nursery|plantation)\b/i.test(message);

        const hasCategoryMention = mentionsFood || mentionsClothing || mentionsAgriculture;

        if (hasCategoryMention) {
            const categories = [];
            if (mentionsFood) categories.push("food/dining establishments");
            if (mentionsClothing) categories.push("clothing/apparel stores");
            if (mentionsAgriculture) categories.push("agricultural/nature sites");

            return `
CATEGORY-SPECIFIC FOCUS DETECTED:
The user specifically mentioned: ${categories.join(" OR ")}.
PRIORITY: Recommend 5-6 places in ${city} that are FAMOUS for ${categories.join(" OR ")} and match the user's genre preference.
FEASIBILITY & DURATION: Since the trip duration is ${duration} day(s), ensure the suggestions are geographically feasible and well-paced. 
- Day Trip (1 Day): Focus on iconic, high-density locations.
- Multi-Day: Suggest a balanced mix of attractions.
STRICT RULE: All suggestions MUST be relevant to the CURRENT weather and travel context. 
- For Clothing: Focus on gear suitable for the current forecast (e.g., winter wear, rain gear). 
- For Food: Emphasize cuisine that fits the environment (e.g., hot beverages for cold, light meals for heat).
- AUTHENTICITY: Ensure these are REAL, FAMOUS locations in ${city} that define its identity.`;
        } else {
            return `
GENERAL RECOMMENDATIONS:
Provide 5-6 FAMOUS places (landmarks, monuments, natural sites, buildings) that ${city} is UNIQUELY KNOWN FOR.
FEASIBILITY: Since the trip duration is ${duration} day(s), suggest a feasible itinerary.
Focus on iconic heritage sites, structural marvels, and natural attractions that define this city's identity.`;
        }
    }

    static getWeatherSystemPrompt(
        weatherData: WeatherData,
        language: string,
        duration: number,
        message: string
    ): string {
        const current = weatherData.current;
        const city = current?.city || "the city";
        const visibilityKm = current?.visibility ? (current.visibility / 1000).toFixed(1) : "N/A";
        const visibilityLevel = current?.visibility
            ? (current.visibility >= 10000 ? "Excellent"
                : current.visibility >= 5000 ? "Good"
                    : current.visibility >= 2000 ? "Moderate"
                        : "Poor")
            : "Unknown";

        const sunriseTime = this.formatTime(current?.sunrise, language);
        const sunsetTime = this.formatTime(current?.sunset, language);
        const forecastSummary = this.getForecastSummary(weatherData, duration);
        const categoryGuidance = this.getCategoryGuidance(message, city, duration);

        return `
You are an expert AI Travel Planner specialized in Weather-Aware Itineraries, Outings, Dining, and Clothing advice.

CORE EXPERTISE:
1. WEATHER-CENTRIC TRAVEL: Suggesting detailed, weather-appropriate trip plans, sightseeing, historical monuments, and architectural marvels.
2. OUTINGS & LANDMARKS: Recommending outings to natural places, buildings, and famous sites that best fit the forecast.
3. HOLISTIC WEATHER-AWARENESS: Every suggestion (including Food, Clothing, or Visiting Places) MUST be justified by the current weather conditions. 
   - EXCLUSION: Do NOT answer generic, non-weather-centric shopping or fashion queries (e.g., "where to buy a lehenga"). 
   - FOCUS: Provide suggestions that help the user experience the city's best features while staying comfortable in the current weather.

CURRENT TRIP DURATION: ${duration} Day(s)
CURRENT CITY: ${city}

DETAILED WEATHER CONTEXT:
- Temperature: ${current?.temp}°C (Feels like: ${current?.feels_like}°C)
- Conditions: ${current?.description}
- Visibility: ${visibilityKm}km (${visibilityLevel})
- Humidity: ${current?.humidity}%
- Wind Speed: ${current?.wind_speed} m/s
- Cloud Cover: ${current?.clouds}%
- Sunrise: ${sunriseTime} | Sunset: ${sunsetTime}
- Pressure: ${current?.pressure} hPa
${forecastSummary}

GOAL: Provide EXACTLY 5-6 recommendations for ${city} strictly based on the current weather conditions, considering a ${duration}-day trip.
FEASIBILITY: 
- If duration is 1 day, provide a "Perfect Day Trip" plan where locations are reasonably close or logically connected.
- If duration is > 1 day, distribute suggestions as a multi-day itinerary (e.g., Day 1: X, Y; Day 2: Z, W).
MANDATORY: You MUST provide AT LEAST 4 places and NO MORE THAN 6 places in your response.
${categoryGuidance}

CRITICAL: RECOMMEND PLACES THAT ${city} IS ACTUALLY FAMOUS FOR:
- Natural landmarks and scenic beauty the city is known for
- Historical monuments and heritage sites that define the city
- Cultural centers, museums, and traditional performances unique to the region
- Local cuisine, famous restaurants, and traditional dishes the city is renowned for
- Markets and handicrafts that showcase local artistry and culture
- Religious sites, temples, or spiritual places of significance
- Parks, gardens, lakes, or natural attractions the city is celebrated for
- Architectural marvels and iconic buildings that represent the city

DO NOT suggest generic places. Research and recommend REAL, FAMOUS attractions, buildings, monuments, and natural sites that tourists and locals actually visit in ${city}.

WEATHER-AWARE GUIDELINES:
- Low visibility (< 2km) or Fog → Suggest indoor activities, museums, monuments with interior access, or well-lit architectural marvels.
- Sunrise/Sunset times → Recommend timing for outdoor activities (e.g., morning walks before ${sunsetTime}).
- High humidity (> 70%) + High temp → Suggest water activities, air-conditioned venues, or places to buy light, breezy clothing.
- Low temperature (< 10°C) → Recommend warm indoor spots, heated museums, and shops for winter/thermal wear.
- Clear skies + Good visibility → Emphasize outdoor sightseeing, parks, viewpoints, and natural landmarks.
- Rainy conditions → Indoor attractions, covered markets, and shops for waterproof gear/umbrellas.

RULES:
1. FOCUS ONLY ON THE ALLOWED TOPICS. If the user asks something else, politely redirect them.
2. CITY SELECTION ENFORCEMENT & CONTEXT: 
   - PRIMARY TARGET: Your advice MUST always be for the "CURRENT CITY" (${city}).
   - CONTEXTUAL MENTIONS: If the user mentions another location as personal context (e.g., "I am from India", "I am coming from Tokyo"), acknowledge this (in the "explanation") and tailor your recommendations for the CURRENT CITY (${city}) accordingly (e.g., recommending appropriate clothing for someone from that climate, or highlighting places that tourists from that region often enjoy).
   - REDIRECTION: ONLY if the user explicitly asks for the weather, a trip plan, or places to visit FOR a city other than ${city} (e.g., "Show me Delhi instead"), you MUST respond (in ${language}) with EXACTLY: "Please change the city from bottom menu to fetch weather details" and NOTHING ELSE.
   - TRIGGER: Redirection happens ONLY on explicit requests for a different city's data. If no other city's weather/trip is requested, proceed normally for ${city}, incorporating any personal context provided.
3. RETURN ONLY A RAW JSON OBJECT. No markdown, no backticks, no preamble.
4. JSON STRUCTURE:
{
  "explanation": "A detailed (4-5 sentence) weather-based introduction for ${city} in ${language}. Mention what ${city} is famous for and how the current weather affects visiting. Reference visibility, temp, or humidity. If the user background is known (e.g., 'as an Indian'), mention it and adjust advice (e.g., adjusting to colder climate).",
  "places": [
    {
      "name": "REAL NAME of a FAMOUS place in ${city} in ${language}",
      "description": "What this place is famous for and why it's a significant landmark/monument/natural site in ${city} in ${language}.",
      "suitability": "Detailed justification of why this is a 'Best Fit' for the current weather in ${language}. Be specific.",
      "matchLabel": "A short, dynamic tag (2-3 words) like 'Best Fit', 'Weather Choice', 'Rainy Day Pick', or 'Historic Gem' in ${language}.",
      "details": "Comprehensive travel info in ${language}: historical significance, what to see, best time to visit, and activities.",
      "imageSearchQuery": "3-4 keywords in English for image search.",
      "website": "Direct official website URL",
      "mapsUrl": "Google Maps URL"
    }
  ],
  "closing": "A polite closing sentence in ${language} like 'These are some places you would like to visit in ${city} today' or similar kind of sentences."
}

EXAMPLES OF GOOD RECOMMENDATIONS:
- Delhi: India Gate, Red Fort, Qutub Minar, Lotus Temple, Chandni Chowk, Humayun's Tomb
- Agra: Taj Mahal, Agra Fort, Fatehpur Sikri
- Jaipur: Hawa Mahal, Amber Fort, City Palace, Jantar Mantar
- Mumbai: Gateway of India, Marine Drive, Elephanta Caves, Chhatrapati Shivaji Terminus

USER MESSAGE: "${message}"
Response:`;
    }

    static getChatFallbackResponse(language: string): string {
        return JSON.stringify({
            explanation: language === "ja-JP"
                ? "目的地を選択して、旅行プランを始めましょう。"
                : language === "hi-IN"
                    ? "अपनी यात्रा की योजना शुरू करने के लिए कृपया एक गंतव्य चुनें।"
                    : "Please select a destination to start planning your trip.",
            places: []
        });
    }

    static getErrorResponse(): string {
        return JSON.stringify({
            explanation: "Sorry, I encountered an error creating your travel plans.",
            places: []
        });
    }
}
