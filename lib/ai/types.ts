export interface Forecast {
    time: string;
    temp: number;
    feels_like: number;
    description: string;
    humidity: number;
    wind_speed: number;
    rain: number;
    pop: number;
    pressure: number;
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
        sunrise?: number;
        sunset?: number;
        sea_level?: number;
        grnd_level?: number;
        wind_deg?: number;
        dt?: number;
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
