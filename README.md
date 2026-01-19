# 天気トーク (Tenki Talk)

A multilingual weather-aware travel assistant with an AI-powered conversational interface, voice input support, and a vibrant, dynamic UI.

## Features

- **Travel-Niche Focus**: Specialized in weather-aware itineraries, outings, food, and activity planning.
- **Multilingual Support**: English, Japanese (日本語), Hindi (हिन्दी).
- **Voice Input**: Hybrid STT using Browser-native Speech Recognition and OpenAI Whisper.
- **Mandatory UI Location Selection**: Ensures high-accuracy weather context by using explicit Country and City selectors.
- **Vibrant Weather UI**: Dynamic temperature-based coloring and 2x2 forecast grid for desktop.
- **Mobile Optimized**: Exclusive "Mode Switching" (Chat vs Location) and bottom-anchored controls for a premium mobile experience.

## Architecture

### AI Models

**Primary Model**
- Model is defined via environment configuration.
- Default: Meta Llama 3.2 3B Instruct (Hugging Face)
- Optimized for fast inference, low latency, and structured JSON output.
- Used for real-time conversational responses.

**Fallback Model(s)**
- Fully configurable via environment variables.
- Automatically activated when the primary model fails, times out, or hits rate limits.
- Can be switched to any supported provider or model (e.g., Gemini, OpenAI, Anthropic, etc.) without code changes.
- Ensures high availability and service continuity.

**Design**: Provider-agnostic interface enables seamless model switching and robust fallback logging.

### Speech Recognition

**Tier 1: Web Speech API**
- Zero-latency local transcription for supported browsers (Chrome, Edge).

**Tier 2: Whisper Large V3 (Hugging Face / Worker)**
- Universal browser compatibility (Firefox, Safari) and high accuracy for complex multilingual audio.

### Weather Data
- **Source**: OpenWeatherMap API.
- **Caching**: Intelligent in-memory caching for performance.
- **Dynamic Themes**: Real-time theme generation based on ambient temperature.

## Quick Start

### Prerequisites
- API keys for:
  - Hugging Face (Inference API)
  - Google AI (Gemini API)
  - OpenWeatherMap
  - GeoNames (for city search)

### Configuration

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_google_ai_key
HUGGINGFACE_API_KEY=your_hf_token
OPENWEATHERMAP_API_KEY=your_weather_key
NEXT_PUBLIC_GEONAMES_USER=your_geonames_username
```

### Installation

```bash
# Clone the repository
git clone https://github.com/akashsingh3414/Tenki-Talk-Weather-AI
cd Tenki-Talk-Weather-AI

# Install dependencies
npm install

# Run Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tenki-talk/
├── app/
│   ├── api/chat/         # AI logic with robust JSON parsing & fallbacks
│   └── page.tsx          # Main layout with responsive mode-switching
├── lib/
│   ├── ai/               # AI provider abstractions (Gemini, Llama)
│   ├── i18n.ts           # Centralized UI labels for JA, HI, EN
│   └── weather.ts        # Modular weather API client
└── components/
    ├── weather_display/  # Dynamic, temperature-aware forecast UI
    ├── location_selector/# Searchable Country/City selectors
    ├── travel_card/      # Rich suggestion display with Maps integration
    └── chat_input/       # Mode-aware mobile input with voice support
```

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| AI Providers | Hugging Face, Google Generative AI |
| STT | Web Speech API, OpenAI Whisper |
| Styling | Vanilla CSS, Tailwind CSS, Lucide Icons |
| Language | TypeScript |
| UI/UX | Framer Motion (Animations), Responsive Stacked Layouts |
