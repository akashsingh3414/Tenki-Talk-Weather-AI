import { WeatherData, Forecast } from "@/lib/types";

export class PromptManager {
    private static formatTime(timestamp: number | undefined, language: string): string {
        if (!timestamp) return "N/A";
        const locale = language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US";
        return new Date(timestamp * 1000).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    private static getForecastSummary(weatherData: WeatherData, duration: number, language: string): string {
        if (duration <= 0 || !weatherData.forecast?.length) return "";

        const labels = language === "ja-JP"
            ? { morning: "朝", day: "昼", evening: "夕方", night: "夜" }
            : language === "hi-IN"
                ? { morning: "सुबह", day: "दोपहर", evening: "शाम", night: "रात" }
                : { morning: "Morning", day: "Day", evening: "Evening", night: "Night" };

        const days: Record<string, Forecast[]> = {};
        weatherData.forecast.forEach(item => {
            const date = item.time.split(" ")[0];
            if (!days[date]) days[date] = [];
            days[date].push(item);
        });

        const summary = Object.keys(days).sort().slice(0, duration).map(date => {
            const items = days[date];
            const find = (hour: number) => items.find(i => Math.abs(parseInt(i.time.split(" ")[1]) - hour) <= 1);
            const points = [
                { label: labels.morning, item: find(6) || items[0] },
                { label: labels.day, item: find(12) || items[Math.floor(items.length / 2)] },
                { label: labels.evening, item: find(18) || items[Math.max(0, items.length - 2)] },
                { label: labels.night, item: find(21) || items[items.length - 1] },
            ]
                .filter((p, i, self) => p.item && self.findIndex(t => t.item?.time === p.item?.time) === i)
                .map(p => `${p.label}: ${Math.round(p.item!.temp)}°C (${p.item!.description})`)
                .join(" | ");
            return `- ${date}: ${points}`;
        }).join("\n");

        return `\nFORECAST (${duration} day${duration > 1 ? "s" : ""}):\n${summary}\n`;
    }

    private static getCategoryGuidance(message: string, city: string, duration: number): string {
        const is = (pattern: RegExp) => pattern.test(message);
        const categories: string[] = [];
        if (is(/\b(food|restaurant|dining|eat|cuisine|meal|cafe|street food|snacks|vendor)\b/i)) categories.push("restaurants, cafes, or street food stalls");
        if (is(/\b(cloth|fashion|apparel|wear|boutique|textile|garment|shop|mall|retail)\b/i)) categories.push("boutiques, malls, or market sections");
        if (is(/\b(sightseeing|landmark|monument|museum|park|temple|palace|heritage|tour|attraction|iconic)\b/i)) categories.push("landmarks, monuments, or scenic viewpoints");
        if (is(/\b(entertainment|movie|cinema|theatre|club|bar|nightlife|concert|show|festival)\b/i)) categories.push("entertainment venues or events");

        const count = ["3-4", "4-5", "5-6", "6-7", "7-8"][Math.min(duration, 5) - 1] || "3-4";

        if (categories.length > 0) {
            return `CATEGORY FOCUS: ${categories.join(", ")} only — ${count} exact pinpoint locations in ${city}. No other activity types. Tie each to current weather conditions.`;
        }
        return `GENERAL: ${count} famous, pinpoint attractions ${city} is uniquely known for — balancing sightseeing, dining, and landmarks across ${duration} day(s) based on current weather.`;
    }

    static getWeatherSystemPrompt(weatherData: WeatherData, language: string, duration: number, message: string): string {
        const current = weatherData.current;
        const city = current?.city || "the city";
        const visibilityKm = current?.visibility ? (current.visibility / 1000).toFixed(1) : "N/A";
        const visibilityLevel = !current?.visibility ? "Unknown"
            : current.visibility >= 10000 ? "Excellent"
                : current.visibility >= 5000 ? "Good"
                    : current.visibility >= 2000 ? "Moderate" : "Poor";

        const sunrise = this.formatTime(current?.sunrise, language);
        const sunset = this.formatTime(current?.sunset, language);
        const forecast = this.getForecastSummary(weatherData, duration, language);
        const categoryGuidance = this.getCategoryGuidance(message, city, duration);

        return `You are a Weather-Aware AI Travel Planner. You plan trips, outings, dining, and give clothing advice based on real-time weather.

OUTPUT RULES:
- No emojis. Respond in ${language} only (proper nouns may keep native script).
- Return ONLY a JSON object — no text outside it.

CONTEXT RULES (apply before every response):
1. Never repeat a place, venue, or activity already in this conversation.
2. Skip general city intro if the city was already discussed — keep "explanation" specific to this request.
3. "More" / "different" / "other" = entirely new places, not variations of prior ones.
4. City switch = fresh recommendations — don't reuse names from a different city's session.
5. Category request = the full response stays within that category only.
6. Don't re-explain weather already covered — reference new or more specific data points.

TRIP: ${duration} day(s) in ${city}

WEATHER (every place must reference at least one of these):
- Temp: ${current?.temp}°C (feels like ${current?.feels_like}°C)
- Conditions: ${current?.description}
- Humidity: ${current?.humidity}% | Wind: ${current?.wind_speed} m/s | Clouds: ${current?.clouds}%
- Visibility: ${visibilityKm}km (${visibilityLevel})
- Sunrise: ${sunrise} | Sunset: ${sunset}
- Pressure: ${current?.pressure} hPa
${forecast}
RULES:
- Recommend places in ${city} ONLY.
- If asked about another city, reply: "Please change the city from the bottom menu."
- If asked something non-travel: "I'm a travel planner — please ask travel-related questions."
- Only cover: trips, sightseeing, dining, clothing, entertainment, wellness, markets, transport.

WEATHER PRIORITIES:
- >25°C: AC venues, early-morning/post-sunset outdoors, light clothing
- <10°C: Warm indoor venues, comfort food, winter wear
- Rain/Monsoon: Covered venues, street food under shelter, rain gear
- Fog/Visibility <2km: Indoor attractions, enclosed monuments
- Humidity >70% + Heat: AC venues, water activities, breathable fabrics
- Clear + Good visibility: Outdoor sightseeing, open-air markets, rooftop dining near ${sunset}

ITINERARY SCALE:
- 1 day: 2-3 places | 2 days: 3-5 | 3 days: 4-6 | 4 days: 5-7 | 5 days: 6-8
- Schedule outdoor activities near sunrise (${sunrise}) or sunset (${sunset}).

${categoryGuidance}

RESPONSE FORMAT (return this JSON, all fields present):
{
  "explanation": "1-3 sentences tied to weather and user request — not a generic city intro",
  "places": [{
    "day": 1, "timeOfDay": "Morning",
    "name": "Exact Place Name",
    "description": "What it is and why it's notable",
    "suitability": "Why it fits today's weather (mention temp/humidity/conditions)",
    "weatherMatch": "Short tag e.g. 'Ideal for ${current?.temp}°C afternoons'",
    "details": "What to do, see, or wear there",
    "imageSearchQuery": "3-4 search keywords",
    "mapsUrl": "https://www.google.com/maps/search/Place+Name+${city}"
  }],
  "closing": "One practical weather-aware tip"
}

USER: "${message}"`;
    }
}