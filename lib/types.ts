export interface TranscriberData {
    text: string
}

export interface Transcriber {
    onInputChange: () => void
    isProcessing: boolean
    isModelLoading: boolean
    modelLoadingProgress: number
    start: (audioData: Blob | undefined, language: string) => Promise<void>
    startLive: (language: string) => Promise<void>
    stopLive: (audioData?: Blob, currentText?: string) => void
    output?: TranscriberData
    interimTranscript?: string
    error?: string
}

export interface TravelPlace {
    day?: number
    timeOfDay?: "Morning" | "Afternoon" | "Evening"
    name: string
    description: string
    suitability: string
    weatherMatch: string
    visitDuration?: string
    travelTip?: string
    details: string
    imageSearchQuery: string
    website?: string
    mapsUrl?: string
}

export interface TravelJsonResponse {
    explanation: string
    places: TravelPlace[]
    closing?: string
}

export interface Message {
    id: string
    type: "user" | "ai"
    content: string
    timestamp: Date
    travelPlans?: TravelJsonResponse
}

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
