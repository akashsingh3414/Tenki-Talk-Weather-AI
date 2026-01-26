# 天気トーク (Tenki Talk)

A multilingual, weather-aware AI travel planner that creates personalized itineraries, recommends local spots, and suggests outfits based on real-time weather and multi-day forecasts.

---

## Why Tenki Talk?

Tenki Talk goes beyond generic travel suggestions by **actively using real-time and forecasted weather** to decide *what to do, when to do it, and what to wear*.

**What makes it different:**

* Weather-aware, time-sensitive itineraries
* Smart multi-day trip planning (1–5 days)
* Multilingual & culturally aware (English, 日本語, हिन्दी)
* Voice-enabled input with intelligent fallbacks
* Dynamic UI that adapts to temperature and device

---

## Key Features

* **Weather-Aware Planning**: Activities adapt to real-time and forecasted conditions
* **Time-Sliced Forecast Intelligence**: Uses Morning, Day, Evening, and Night weather contexts
* **Multi-Day Trips**: Automatically balances pacing and activity density
* **Outfit Suggestions**: Weather-, climate-, and season-appropriate clothing advice
* **Strict Travel Scope**: Only travel, dining, entertainment, and outing-related recommendations

---

## Tech Stack

| Category       | Technology                                         |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 16 (App Router)                            |
| UI             | React 19                                           |
| Language       | TypeScript                                         |
| Styling        | Tailwind CSS v4, Lucide Icons                      |
| Animations     | Framer Motion                                      |
| AI             | Hugging Face (Llama 3.2), Google Gemini (Fallback) |
| Speech-to-Text | Web Speech API, OpenAI Whisper                     |
| Weather        | OpenWeatherMap                                     |
| Location       | GeoNames                                           |

---

## Getting Started

### Prerequisites

You’ll need API keys for:

* Hugging Face
* Google Gemini
* OpenWeatherMap
* GeoNames

### Environment Setup

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_google_ai_key
HUGGINGFACE_API_KEY=your_hf_token
OPENWEATHERMAP_API_KEY=your_weather_key
NEXT_PUBLIC_GEONAMES_USER=your_geonames_username
```

### Installation

```bash
git clone https://github.com/akashsingh3414/Tenki-Talk-Weather-AI
cd Tenki-Talk-Weather-AI
npm install
npm run dev
```

---

## Example Usage

### 2-Day Trip Planning

**Input**: "I'm in Chennai for 2 days"

**Output**:

* Day 1: Morning temples, afternoon museums (heat-aware)
* Day 2: Morning beach, evening sunset dining

### Clothing Advice

**Input**: "What should I wear in Delhi in January?"

**Output**: Layered clothing, warm outerwear, walking-friendly shoes

### Weather-Safe Dining

**Input**: "Street food spots in monsoon Mumbai"

**Output**: Covered markets and indoor food courts with safety tips

---
