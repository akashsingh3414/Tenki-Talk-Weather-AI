import { WeatherData } from "../ai/types";

interface ForecastItem {
    dt_txt: string;
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
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
    pop: number;
}

const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL = 0.5 * 60 * 60 * 1000;

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
        "Tornado": "竜巻き",
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

const cityTranslations: Record<string, Record<string, string>> = {
    "ja": {
        "Tokyo": "東京",
        "Kyoto": "京都",
        "Osaka": "大阪",
        "Okinawa": "沖縄",
        "Sapporo": "札幌",
        "Paris": "パリ",
        "London": "ロンドン",
        "New York": "ニューヨーク",
        "Dubai": "ドバイ",
        "Mumbai": "ムンバイ",
    },
    "hi": {
        "Tokyo": "टोक्यो",
        "Kyoto": "क्योटो",
        "Osaka": "ओसाका",
        "Okinawa": "ओकिनावा",
        "Sapporo": "सप्पोरो",
        "Paris": "पेरिस",
        "London": "लंदन",
        "New York": "न्यूयॉर्क",
        "Dubai": "दुबई",
        "Mumbai": "मुंबई",
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

function translateCityName(city: string, langCode: string): string {
    return cityTranslations[langCode]?.[city] || city;
}

export function getVisibilityLevel(visibilityMeters: number, language: string = "en-US"): string {
    const langCode = mapLanguageCode(language);
    const visibilityKm = visibilityMeters / 1000;

    if (visibilityKm >= 10) return langCode === "ja" ? "優秀" : langCode === "hi" ? "उत्कृष्ट" : "Excellent";
    if (visibilityKm >= 5) return langCode === "ja" ? "良好" : langCode === "hi" ? "अच्छा" : "Good";
    if (visibilityKm >= 2) return langCode === "ja" ? "普通" : langCode === "hi" ? "मध्यम" : "Moderate";
    return langCode === "ja" ? "悪い" : langCode === "hi" ? "खराब" : "Poor";
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<Response> {
    try {
        const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok && retries > 0 && response.status >= 500) {
            throw new Error(`Server Error: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
}

export async function fetchWeatherData(city: string, language: string = "en-US"): Promise<WeatherData | null> {
    const normalizedCity = city.toLowerCase().trim();
    const langCode = mapLanguageCode(language);
    const cacheKey = `${normalizedCity}_${langCode}_v2`;

    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
        throw new Error("Weather API key not configured");
    }

    try {
        const weatherRes = await fetchWithRetry(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`
        );

        if (!weatherRes.ok) {
            if (weatherRes.status === 404) return null;
            throw new Error(`Weather API error: ${weatherRes.statusText}`);
        }

        const weatherData = await weatherRes.json();

        const forecastRes = await fetchWithRetry(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${langCode}`
        );

        const forecastData = await forecastRes.json();

        const next24HoursForecast = forecastData.list || [];

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
                city: translateCityName(weatherData.name, langCode),
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
                feels_like: item.main?.feels_like,
                description: item.weather?.[0]?.description,
                humidity: item.main?.humidity,
                wind_speed: item.wind?.speed,
                rain: item.rain?.["3h"] || 0,
                pop: item.pop || 0,
                pressure: item.main?.pressure,
            })),
        };

        weatherCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
    } catch (error) {
        if (cached) {
            return cached.data;
        }
        throw error;
    }
}
