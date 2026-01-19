
import { WeatherData } from "./ai/types";

interface ForecastItem {
    dt_txt: string;
    main: {
        temp: number;
        humidity: number;
    };
    weather: {
        main: string;
        description: string;
    }[];
    wind: {
        speed: number;
    };
    rain?: {
        "3h"?: number;
    };
}

const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000;

const weatherTranslations: Record<string, Record<string, string>> = {
    "ja": {
        "Clear": "快晴",
        "Clouds": "曇り",
        "Rain": "雨",
        "Drizzle": "霧雨",
        "Thunderstorm": "雷雨",
        "Snow": "雪",
        "Mist": "霧",
        "Smoke": "煙",
        "Haze": "霞",
        "Dust": "砂塵",
        "Fog": "霧",
        "Sand": "砂",
        "Ash": "灰",
        "Squall": "スコール",
        "Tornado": "竜巻",
    },
    "hi": {
        "Clear": "साफ",
        "Clouds": "बादल",
        "Rain": "बारिश",
        "Drizzle": "बूंदाबांदी",
        "Thunderstorm": "आंधी",
        "Snow": "बर्फबारी",
        "Mist": "धुंध",
        "Smoke": "धुआं",
        "Haze": "धुंध",
        "Dust": "धूल",
        "Fog": "कोहरा",
        "Sand": "रेत",
        "Ash": "राख",
        "Squall": "झोंका",
        "Tornado": "बवंडर",
    }
};

function mapLanguageCode(lang: string): string {
    if (lang.startsWith("ja")) return "ja";
    if (lang.startsWith("hi")) return "hi";
    return "en";
}

function translateWeatherMain(main: string, langCode: string): string {
    return weatherTranslations[langCode]?.[main] || main;
}

export function getVisibilityLevel(visibilityMeters: number, language: string = "en-US"): string {
    const langCode = mapLanguageCode(language);
    const visibilityKm = visibilityMeters / 1000;

    if (visibilityKm >= 10) return langCode === "ja" ? "優秀" : langCode === "hi" ? "उत्कृष्ट" : "Excellent";
    if (visibilityKm >= 5) return langCode === "ja" ? "良好" : langCode === "hi" ? "अच्छा" : "Good";
    if (visibilityKm >= 2) return langCode === "ja" ? "普通" : langCode === "hi" ? "मध्यम" : "Moderate";
    return langCode === "ja" ? "悪い" : langCode === "hi" ? "खराब" : "Poor";
}

export async function fetchWeatherData(city: string, language: string = "en-US"): Promise<WeatherData | null> {
    const normalizedCity = city.toLowerCase().trim();
    const langCode = mapLanguageCode(language);
    const cacheKey = `${normalizedCity}_${langCode}`;

    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Weather Cache] Serving cached data for: ${cacheKey}`);
        return cached.data;
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
        throw new Error("Weather API key not configured");
    }

    try {
        console.log(`[Weather API] Fetching fresh data for city: ${city} (lang: ${langCode})`);
        const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`
        );

        if (!weatherRes.ok) {
            if (weatherRes.status === 404) return null;
            throw new Error(`Weather API error: ${weatherRes.statusText}`);
        }

        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`
        );

        const forecastData = await forecastRes.json();

        const next24HoursForecast = forecastData.list?.slice(0, 8) || [];

        const result: WeatherData = {
            current: {
                temp: weatherData.main?.temp,
                feels_like: weatherData.main?.feels_like,
                humidity: weatherData.main?.humidity,
                pressure: weatherData.main?.pressure,
                description: translateWeatherMain(weatherData.weather?.[0]?.main, langCode),
                details: weatherData.weather?.[0]?.description,
                wind_speed: weatherData.wind?.speed,
                clouds: weatherData.clouds?.all,
                visibility: weatherData.visibility,
                uvi: weatherData.uvi || null,
                city: weatherData.name,
                country: weatherData.sys?.country,
                sunrise: weatherData.sys?.sunrise,
                sunset: weatherData.sys?.sunset,
                sea_level: weatherData.main?.sea_level,
                grnd_level: weatherData.main?.grnd_level,
                wind_deg: weatherData.wind?.deg,
                dt: weatherData.dt,
            },
            forecast: next24HoursForecast.map((item: ForecastItem) => ({
                time: item.dt_txt,
                temp: item.main?.temp,
                description: item.weather?.[0]?.description,
                humidity: item.main?.humidity,
                wind_speed: item.wind?.speed,
                rain: item.rain?.["3h"] || 0,
            })),
        };

        weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
    } catch (error) {
        console.error(`[Weather API] Failed to fetch for ${city}:`, error);
        if (cached) {
            console.log(`[Weather Cache] Serving STALE data due to API error for: ${cacheKey}`);
            return cached.data;
        }
        throw error;
    }
}
