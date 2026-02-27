# 天気トーク — Tenki Talk

> **Weather-aware AI travel planning, reimagined.**

Tenki Talk is a multilingual AI travel assistant that generates real-time, context-sensitive itineraries by integrating live weather data into every recommendation. Rather than offering static suggestions, it adapts plans dynamically to temperature, humidity, visibility, and multi-day forecasts.

---

## Features

| Feature | Description |
|---|---|
| **Weather-Aware Itineraries** | Every recommendation is grounded in live weather data — conditions, temperature, humidity, and visibility inform each suggestion |
| **Multi-Day Planning** | Intelligent itinerary pacing across 1–5 days, with activity density scaled per duration |
| **Forecast Integration** | Per-day Morning, Afternoon, Evening, and Night weather snapshots for accurate scheduling |
| **Category Intelligence** | Requests filtered by topic (dining, sightseeing, nightlife, clothing) — responses stay strictly within scope |
| **Outfit Recommendations** | Season- and condition-appropriate clothing suggestions tied to current weather |
| **Multilingual Support** | Full support for English, 日本語 (Japanese), and हिन्दी (Hindi) |
| **Voice Input** | Speech-to-text via Web Speech API with OpenAI Whisper as fallback |
| **Google Authentication** | Secure, passwordless sign-in via Firebase Authentication |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Lucide Icons |
| AI — Primary | Groq (`llama-3.3-70b-versatile`) |
| AI — Fallback | Hugging Face (`Llama-3.2-3B-Instruct`) |
| Speech-to-Text | Web Speech API, OpenAI Whisper |
| Weather Data | OpenWeatherMap |
| Location Data | GeoNames |
| Authentication | Firebase Authentication (Google Sign-In) |

---

## Getting Started

### Prerequisites

Obtain API credentials for the following services:

- [Groq](https://console.groq.com/)
- [Hugging Face](https://huggingface.co/settings/tokens)
- [OpenWeatherMap](https://openweathermap.org/api)
- [GeoNames](https://www.geonames.org/login)
- [Firebase](https://console.firebase.google.com/) — Authentication only, no Firestore required

### Environment Configuration

Create a `.env.local` file at the project root:

```env
OPENWEATHERMAP_API_KEY=

GROQ_API_KEY=
HUGGINGFACE_API_KEY=

NEXT_PUBLIC_GEONAMES_USER=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

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
```
Plan a 2-day trip in Chennai
```
Generates a weather-balanced itinerary — indoor venues during peak heat, outdoor activities scheduled around sunrise and sunset.

**Category-specific request**
```
Street food spots in monsoon Mumbai
```
Returns covered markets and sheltered stalls only, with weather-appropriate safety notes.

**Outfit planning**
```
What should I wear in Delhi in January?
```
Recommends layered clothing and appropriate footwear based on current temperature and conditions.

---

## License

MIT
