export interface Forecast {
    time: string;
    temp: number;
    description: string;
    humidity: number;
    wind_speed: number;
    rain: number;
}

export interface WeatherData {
    current?: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
        description: string;
        details: string;
        wind_speed: number;
        clouds: number;
        visibility: number;
        city: string;
        country: string;
        uvi: number | null;
        sunrise?: number; // Unix timestamp
        sunset?: number; // Unix timestamp
        sea_level?: number; // hPa
        grnd_level?: number; // hPa
        wind_deg?: number; // degrees
        dt?: number; // Unix timestamp
    };
    forecast?: Forecast[];
}

export type IntentType =
    | "location_change"
    | "weather_query"
    | "general_query"
    | "outing"
    | "food"
    | "forecast"
    | "general";

export interface Intent {
    type: IntentType;
    location?: string;
}
