"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useTranscriber } from "./hooks/useTranscriber"
import { ChatMessage } from "@/components/chat_message"
import { Header } from "@/components/header"
import { LocationSelector } from "@/components/location_selector"
import { i18n, type Language } from "@/lib/i18n"
import { WeatherDisplay } from "@/components/weather_display"
import { ChatInput } from "@/components/chat_input"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  travelPlans?: TravelJsonResponse
}

interface TravelJsonResponse {
  explanation: string
  places: Array<{
    name: string
    description: string
    suitability: string
    details: string
    imageSearchQuery: string
    website?: string
    mapsUrl?: string
  }>
}

interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    description: string
    details: string
    wind_speed: number
    clouds: number
    visibility: number
    city: string
    country: string
  }
  forecast: Array<{
    time: string
    temp: number
    description: string
    humidity: number
    wind_speed: number
    rain: number
  }>
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("ja-JP")
  const [messages, setMessages] = useState<Message[]>([])
  const [started, setStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [showLocations, setShowLocations] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const labels = i18n[language].home
  const transcriber = useTranscriber()

  useEffect(() => {
    setLanguage("ja-JP")
  }, [])

  useEffect(() => {
    if (started && messages.length === 0) {
      setMessages([
        {
          id: "0",
          type: "ai",
          content: i18n[language].home.welcome,
          timestamp: new Date(),
        },
      ])
    }
  }, [language, started, messages.length])

  const handleSendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return
      if (!selectedCity) {
        const aiWarning: Message = {
          id: Date.now().toString() + "-warning",
          type: "ai",
          content: i18n[language].citySelector.selectCityAIWarning,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiWarning])
        setChatInput("")
        return
      }
      if (!started) setStarted(true)

      setIsLoading(true)
      setError("")

      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        content: userMessage,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setChatInput("")

      const chatHistory = messages.slice(-10).map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.content,
      }))

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            city: selectedCity,
            countryCode: selectedCountry,
            weatherData: currentWeather,
            language,
            history: chatHistory,
          }),
        })

        const data = await res.json()
        const suggestions = data.suggestions

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: suggestions?.explanation || (typeof suggestions === "string" ? suggestions : ""),
            travelPlans: suggestions?.places ? suggestions : undefined,
            timestamp: new Date(),
          },
        ])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: "ai",
            content:
              (language === "ja-JP" ? "申し訳ありません: " : "Sorry: ") +
              (err instanceof Error ? err.message : "Error"),
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [language, started, messages, selectedCity, selectedCountry, currentWeather]
  )

  const handleAudioSubmit = useCallback(
    async (audioBlob: Blob) => {
      if (!transcriber) return

      await transcriber.stopLive(audioBlob)
    },
    [transcriber]
  )

  useEffect(() => {
    if (transcriber.output?.text) {
      handleSendMessage(transcriber.output.text)
      transcriber.onInputChange()
    }
  }, [transcriber.output, handleSendMessage, transcriber])

  const handleLocationSelect = async (city: string) => {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, language }),
      })
      const data = await res.json()
      setCurrentWeather(data)
      setWeatherOpen(true)
      if (!started) setStarted(true)
    } catch {
      setError("Failed to fetch weather")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onHomeClick={() => window.location.reload()}
        currentCity={currentWeather?.current?.city || selectedCity}
        temperature={currentWeather?.current?.temp}
      />

      {currentWeather && currentWeather.current && (
        <div className="lg:hidden border-b border-border bg-muted/20">
          <button
            onClick={() => setWeatherOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 font-semibold"
          >
            <span>{currentWeather?.current?.city} Weather</span>
            {weatherOpen ? <ChevronUp /> : <ChevronDown />}
          </button>

          {weatherOpen && (
            <div className="relative z-0 px-4 pb-4 animate-in slide-in-from-top-2 overflow-y-auto max-h-[50vh] no-scrollbar">
              <WeatherDisplay
                weatherData={currentWeather}
                language={language}
                isVertical={true}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border/50 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 scroll-smooth">
            {!started && messages.length === 0 ? (
              <div className="min-h-full flex flex-col items-center justify-center py-12">
                <div className="max-w-2xl w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                      {labels.hero.title}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
                      {labels.hero.description}
                    </p>
                  </div>

                  <div className="max-w-xl mx-auto space-y-4 pt-6">
                    {labels.hero.details.map((detail, i) => (
                      <div key={i} className="flex gap-4 text-lg text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 items-start">
                        <span className="flex-none font-black text-blue-600 dark:text-blue-400 text-xl">
                          {i + 1}
                        </span>
                        <p className="font-medium tracking-tight">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-6">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} language={language} />
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="relative z-50 border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col-reverse lg:flex-row-reverse gap-3 max-w-7xl mx-auto w-full md:w-[95%] lg:w-[90%]">
              <div className="flex-1 min-w-0 w-full">
                <ChatInput
                  value={chatInput}
                  onChange={setChatInput}
                  onSendMessage={() => handleSendMessage(chatInput)}
                  onAudioRecorded={handleAudioSubmit}
                  isLoading={isLoading}
                  language={language}
                  transcriber={transcriber}
                  currentCity={currentWeather?.current?.city || selectedCity}
                  showLocations={showLocations}
                  onToggleLocations={() => setShowLocations(!showLocations)}
                />
              </div>

              <div className={`w-full lg:w-auto ${showLocations ? "block" : "hidden lg:block"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <LocationSelector
                  language={language}
                  selectedCountry={selectedCountry}
                  selectedCity={selectedCity}
                  onCountryChange={(country) => {
                    setSelectedCountry(country)
                    setSelectedCity("")
                    setCurrentWeather(null)
                  }}
                  onCityChange={(city) => {
                    setSelectedCity(city)
                    handleLocationSelect(city)
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {currentWeather && currentWeather.current && (
          <div className="hidden lg:flex flex-none w-[420px] h-full bg-blue-50/50 dark:bg-slate-900 border-l border-blue-100 dark:border-slate-800 overflow-y-auto">
            <div className="p-5 w-full min-h-full flex flex-col">
              <WeatherDisplay
                weatherData={currentWeather}
                language={language}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
