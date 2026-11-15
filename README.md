# 天気トーク — Tenki Talk

> **Weather-aware AI travel planning, reimagined.**

Tenki Talk is a multilingual AI travel assistant that creates context-aware trip plans from current weather, forecast, and air-quality data. It helps users choose activities and clothing that suit local conditions.

---

## Features

| Feature                       | Description                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Weather- and AQI-Aware Plans** | Recommendations consider temperature, humidity, wind, visibility, current AQI, and forecast AQI when available.          |
| **Multi-Day Planning**        | Plans trips lasting 1–5 days, with activities paced across the trip.                                                      |
| **Scrollable Forecast**       | Browse forecast cards by date; the partial next card indicates that more times are available by swiping.                 |
| **Category Intelligence**     | Keeps requests focused on dining, sightseeing, nightlife, clothing, and other supported travel topics.                    |
| **Outfit Recommendations**    | Suggests clothing based on current conditions and the forecast.                                                           |
| **Multilingual Support**      | Supports English, 日本語 (Japanese), and हिन्दी (Hindi).                                                                    |
| **Voice Input**               | Uses browser speech recognition where available, with Gemini transcription as the cloud fallback.                         |
| **Google Authentication**     | Passwordless sign-in via Firebase Authentication.                                                                         |

---

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Framework      | Next.js (App Router)                      |
| Language       | TypeScript                                |
| Styling        | Tailwind CSS v4, Lucide Icons             |
| AI — Primary   | Google Gemini                             |
| AI — Fallback  | Groq                                      |
| Speech-to-Text | Browser speech recognition, Gemini        |
| Weather and AQI| OpenWeatherMap                            |
| Location Data  | GeoNames                                  |
| Authentication | Firebase Authentication (Google Sign-In)  |

---

## AI Configuration

Gemini generates travel plans first. If the Gemini request fails or its response cannot be parsed, the app tries Groq. For speech input, the app uses browser speech recognition when available and sends audio to Gemini transcription if browser recognition is unavailable or produces no usable transcript. Both Gemini features use the same Google AI API key.

The model IDs can be changed to models available to the corresponding API keys. Defaults are:

```env
GEMINI_MODEL_ID=gemini-3.6-flash
GROQ_MODEL_ID=openai/gpt-oss-120b
GOOGLE_STT_MODEL_ID=gemini-3.5-transcribe
```

`GOOGLE_API_KEY` and `GROQ_API_KEY` are required for their respective services. The old `PRIMARY_MODEL_*`, `FALLBACK_MODEL_*`, and `HUGGINGFACE_API_KEY` settings are not used by the active chat or speech-transcription paths and can be removed from deployment settings.

---

## Air Quality

The app gets current air quality and forecast air quality from OpenWeatherMap's Air Pollution API using the selected city's coordinates and the existing `OPENWEATHERMAP_API_KEY`. OpenWeather returns an AQI category from 1 to 5; the app displays that API value directly as `x/5` and does not convert it to another AQI scale.

The weather panel and forecast cards show the OpenWeather AQI value and category when available. The travel planner uses the same category alongside weather: it favors indoor activities for poor or very poor air quality, suggests that sensitive groups reduce outdoor exertion at moderate levels, and does not assume conditions are healthy when air-quality data is unavailable. If the Air Pollution API does not return data, the app keeps showing weather and marks AQI as unavailable.

---

## Environment Configuration

Create a `.env.local` file at the project root:

```env
OPENWEATHERMAP_API_KEY=
GOOGLE_API_KEY=
GROQ_API_KEY=

GEMINI_MODEL_ID=gemini-3.6-flash
GROQ_MODEL_ID=openai/gpt-oss-120b
GOOGLE_STT_MODEL_ID=gemini-3.5-transcribe

NEXT_PUBLIC_GEONAMES_USER=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

The model IDs are optional; the values shown are the application defaults. `GOOGLE_API_KEY` is used for both Gemini chat and Gemini transcription. `OPENWEATHERMAP_API_KEY` is used for weather and AQI.

---

## Getting Started

### Prerequisites

Obtain API credentials for the following services:

* [Google AI Studio](https://aistudio.google.com/apikey)
* [Groq](https://console.groq.com/)
* [OpenWeatherMap](https://openweathermap.org/api) — current weather, forecast, and air pollution
* [GeoNames](https://www.geonames.org/login)
* [Firebase](https://console.firebase.google.com/) — Authentication only, no Firestore required

### Installation

```bash
git clone https://github.com/akashsingh3414/Tenki-Talk-Weather-AI
cd Tenki-Talk-Weather-AI
npm install
npm run dev
```

---

## Usage Examples

**Multi-day itinerary**

```text
Plan a 2-day trip in Chennai
```

Generates a weather-balanced itinerary — indoor venues during peak heat, outdoor activities scheduled around sunrise and sunset.

**Category-specific request**

```text
Street food spots in monsoon Mumbai
```

Returns covered markets and sheltered stalls only, with weather-appropriate safety notes.

**Outfit planning**

```text
What should I wear in Delhi in January?
```

Recommends layered clothing and appropriate footwear based on current temperature and conditions.

---

## License

MIT
