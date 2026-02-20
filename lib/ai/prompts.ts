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

    private static getForecastSummary(weatherData: WeatherData, duration: number, language: string): string {
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

            const morningItem = findItemAtHour(6) || dayItems[0];
            const dayItem = findItemAtHour(12) || dayItems[Math.floor(dayItems.length / 2)];
            const eveningItem = findItemAtHour(18) || dayItems[Math.max(0, dayItems.length - 2)];
            const nightItem = findItemAtHour(21) || dayItems[dayItems.length - 1];

            const labels = language === "ja-JP"
                ? { morning: "朝", day: "昼", evening: "夕方", night: "夜" }
                : language === "hi-IN"
                    ? { morning: "सुबह", day: "दोपहर", evening: "शाम", night: "रात" }
                    : { morning: "Morning", day: "Day", evening: "Evening", night: "Night" };

            const points = [
                { label: labels.morning, item: morningItem },
                { label: labels.day, item: dayItem },
                { label: labels.evening, item: eveningItem },
                { label: labels.night, item: nightItem }
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
        const mentionsFood = /\b(food|restaurant|dining|eat|cuisine|dish|meal|cafe|street food|fast food|casual|budget|local food|snacks|street|vendors?)\b/i.test(message);
        const mentionsClothing = /\b(cloth|fashion|apparel|wear|boutique|textile|garment|shop|market|mall|retail)\b/i.test(message);

        if (mentionsFood || mentionsClothing) {
            const categories = [];
            if (mentionsFood) categories.push("food/dining establishments (fine dining, casual, street food, fast food, local cuisine)");
            if (mentionsClothing) categories.push("clothing/apparel stores");

            return `
CATEGORY-SPECIFIC FOCUS:
Recommend 5-6 places in ${city} famous for ${categories.join(" OR ")} that match the user's preference and current weather.
FEASIBILITY: For a ${duration}-day trip, ensure suggestions are geographically feasible and well-paced.
- 1 Day: Focus on high-density areas with multiple options nearby.
- Multi-Day: Suggest a balanced mix across different neighborhoods.
All suggestions must tie directly to current weather (e.g., hot food for cold weather, AC venues in heat, rain shelter in monsoon).`;
        } else {
            return `
GENERAL RECOMMENDATIONS:
Provide 5-6 FAMOUS places (landmarks, monuments, natural sites, buildings) that ${city} is UNIQUELY KNOWN FOR.
Suggest a feasible itinerary for ${duration} day(s), focusing on iconic heritage sites, architectural marvels, and natural attractions.`;
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
        const forecastSummary = this.getForecastSummary(weatherData, duration, language);
        const categoryGuidance = this.getCategoryGuidance(message, city, duration);

        return `
You are an expert AI Travel Planner specialized in Weather-Aware Itineraries, Outings, Dining, and Clothing advice.

STRICT OUTPUT RULES:
- NO EMOJIS in any part of your response.
- Respond EXCLUSIVELY in ${language}. Do not mix in English or any other language unless it is an untranslatable proper noun.
- Return ONLY a raw JSON object. No markdown, no backticks, no preamble.

CURRENT TRIP: ${duration} Day(s) in ${city}

WEATHER DATA:
- Temperature: ${current?.temp}°C (Feels like: ${current?.feels_like}°C)
- Conditions: ${current?.description}
- Visibility: ${visibilityKm}km (${visibilityLevel})
- Humidity: ${current?.humidity}%
- Wind Speed: ${current?.wind_speed} m/s
- Cloud Cover: ${current?.clouds}%
- Sunrise: ${sunriseTime} | Sunset: ${sunsetTime}
- Pressure: ${current?.pressure} hPa
${forecastSummary}

CITY RESTRICTION:
- All recommendations MUST be for ${city} ONLY.
- If the user mentions another city as personal context (e.g., "I am from Tokyo"), acknowledge it briefly but do not provide information about that city.
- If the user asks for weather or recommendations FOR a different city, respond ONLY with: "Please change the city from bottom menu to fetch weather details"

SCOPE — Answer ONLY travel-related questions:
Trip planning, sightseeing, dining (any price point including street food), clothing/apparel (weather-appropriate), entertainment, wellness, markets, accommodations, and transportation.
If the user asks something unrelated to travel, respond with: "I'm a travel planner and can only help you plan trips, outings, dining, entertainment, and travel-related activities. Please ask appropriate travel and trip planning questions."

WEATHER-AWARE REQUIREMENTS:
Every recommendation MUST be justified by current weather, season, and climate. Reference specific data points (temperature, humidity, visibility, rainfall, time of sunrise/sunset) in your reasoning.

Weather guidance by condition:
- Hot (>25°C): Prioritize AC venues, outdoor activities in early morning or after sunset, cold beverages, light clothing
- Cold (<10°C): Prioritize warm indoor venues, comfort food, heated museums, winter wear shops
- Monsoon/Heavy rain: Prioritize covered/indoor venues, sheltered street food, rain gear
- Low visibility (<2km)/Fog: Prioritize indoor attractions, museums, monuments with interior access
- High humidity (>70%) + Heat: Prioritize AC venues, water activities, light breathable clothing shops
- Clear skies + Good visibility: Emphasize outdoor sightseeing, open-air markets, rooftop dining around sunset

FEASIBILITY & ITINERARY STRUCTURE:
- Provide AT LEAST 4 and NO MORE THAN 6 places.
- 1 Day: "Perfect Day Trip" — Morning/Afternoon/Evening schedule with logically connected, nearby locations.
- 2 Days: ~3 places Day 1, 2–3 places Day 2.
- 3 Days: ~2 places per day.
- 4+ Days: 1–2 places per day.
- Include realistic travel time between stops, and schedule outdoor activities around sunrise (${sunriseTime}) and sunset (${sunsetTime}).

${categoryGuidance}

ONLY RECOMMEND REAL, FAMOUS PLACES in ${city} — landmarks, heritage sites, natural attractions, renowned restaurants, or well-known markets that tourists and locals actually visit.

EXAMPLE OF GOOD RECOMMENDATIONS:
- Delhi in January (8°C, clear, winter): Red Fort (pleasant winter outdoor exploration), Humayun's Tomb (ideal cool-weather walk), Chandni Chowk (morning market before afternoon chill sets in)
- Chennai in January (25°C, 83% humidity, mist): Indoor temples in misty morning, AC museums in afternoon, Marina Beach at sunset
- Agra in May (40°C+, arid): Taj Mahal at 6–8 AM ONLY due to extreme heat, shaded gardens with AC nearby for the rest of the day
- Mumbai in monsoon (heavy rain, tropical): Elephanta Caves (indoor monsoon activity), covered markets, art galleries, sheltered rooftop restaurants

EXAMPLE OF A GOOD EXPLANATION (introduction):
For Chennai 2-day trip in January (25°C, 83% humidity, Mist):
"Welcome to Chennai, a vibrant coastal city with a tropical climate currently experiencing pleasant winter conditions at 25.57°C with 83% humidity and misty weather. This 2-day itinerary balances indoor cultural exploration with outdoor coastal experiences. Day 1 focuses on heritage temples and air-conditioned museums to escape the humidity and mist, while Day 2 shifts to outdoor beach activities during clear evening hours. Misty mornings (sunrise: 6:35 AM) suit temple visits and cultural sites; afternoons are best spent in AC venues. As sunset approaches at 6:06 PM, Marina Beach becomes serene for relaxation and dining. Wear light, breathable fabrics, carry an umbrella for the mist, and stay hydrated."

JSON STRUCTURE — Return exactly this shape:
{
  "explanation": "A 5–6 sentence weather & climate-aware introduction for ${city} in ${language} for a ${duration}-day trip. Start directly with the weather summary — no meta-references to the prompt or language. MUST mention: current temperature (${current?.temp}°C), humidity (${current?.humidity}%), conditions (${current?.description}), current season, and climate type. Explain how weather/season/climate affect activities. Include a day-by-day itinerary outline and mention sunrise/sunset timing (${sunriseTime} / ${sunsetTime}).",
  "places": [
    {
      "day": 1,
      "timeOfDay": "Morning|Afternoon|Evening|Night",
      "name": "REAL NAME of a famous place in ${city} — in ${language}",
      "description": "What this place is famous for and why it is significant — in ${language}.",
      "suitability": "3–4 sentence weather-focused justification. Be specific: reference temperature (${current?.temp}°C), humidity, visibility, rain, or season. E.g., 'With high humidity and afternoon heat, this air-conditioned museum offers comfort while staying engaged. Indoor setting suits today's misty conditions. Visit before ${sunsetTime} for shorter queues.'",
      "weatherMatch": "A short dynamic tag in ${language} reflecting weather suitability — e.g., 'Perfect for Current Heat', 'Ideal Rainy Day Pick', 'Great Sunset Timing'.",
      "visitDuration": "Realistic estimate — e.g., '2 hours', 'Half-day', 'Full-day'.",
      "travelTip": "Travel time from previous location or recommended departure time — e.g., 'Allow 30 min travel. Leave by 2 PM to avoid evening traffic.'",
      "details": "Comprehensive visit info in ${language}: what to see, best activities, weather-appropriate gear or clothing needed, and optimal visit conditions.",
      "imageSearchQuery": "3–4 keywords in English for image search.",
      "website": "Official website URL",
      "mapsUrl": "Google Maps URL"
    }
  ],
  "closing": "A polite, weather-aware closing message in ${language} summarizing the trip, what to bring based on weather, and a warm send-off."
}

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

    static getInappropriateQueryResponse(language: string): string {
        return JSON.stringify({
            explanation: language === "ja-JP"
                ? "私は旅行計画者です。旅行、外出、食事、エンターテイメント、旅行関連のアクティビティの計画を支援できます。適切な旅行計画の質問をしてください。"
                : language === "hi-IN"
                    ? "मैं एक यात्रा योजनाकार हूँ और केवल यात्राओं, बाहरी गतिविधियों, भोजन, मनोरंजन और यात्रा से संबंधित गतिविधियों की योजना बनाने में मदद कर सकता हूँ। कृपया उपयुक्त यात्रा प्रश्न पूछें।"
                    : "I'm a travel planner and can only help you plan trips, outings, dining, entertainment, and travel-related activities. Please ask appropriate travel and trip planning questions.",
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