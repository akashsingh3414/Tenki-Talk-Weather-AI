"use client"

import { useState, useRef, useEffect, useCallback, useContext } from "react"
import { ChevronDown, ChevronUp, Cloud } from "lucide-react"
import { useTranscriber } from "./hooks/useTranscriber"
import { ChatMessage } from "@/components/chat_message"
import { LocationSelector } from "@/components/location_selector"
import { i18n } from "@/lib/i18n"
import { WeatherDisplay } from "@/components/weather_display"
import { ChatInput } from "@/components/chat_input"
import { FamousPlaces } from "@/components/famous_places"
import { useWeather } from "./hooks/useWeather"
import { LanguageContext } from "@/lib/language_context"

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
    matchLabel: string
    details: string
    imageSearchQuery: string
    website?: string
    mapsUrl?: string
  }>
}

export default function Home() {
  const { language } = useContext(LanguageContext)
  const [messages, setMessages] = useState<Message[]>([])
  const [started, setStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatError, setChatError] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [showLocations, setShowLocations] = useState(false)
  const [showFamous, setShowFamous] = useState(true)
  const [duration, setDuration] = useState(1)

  const {
    weatherData: currentWeather,
    loading: weatherLoading,
    error: _weatherError,
    fetchWeather,
    setWeatherData: setCurrentWeather
  } = useWeather(language)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const labels = i18n[language].home
  const transcriber = useTranscriber()

  useEffect(() => {
    if (started && messages.length === 0) {
      const welcomeMessages = i18n[language].home.welcome
      const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
      setMessages([
        {
          id: "0",
          type: "ai",
          content: randomWelcome,
          timestamp: new Date(),
        },
      ])
    }
  }, [started, messages.length, language])

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
      setChatError("")

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
            duration: Math.min(Math.max(1, duration), 5),
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
        setChatError(err instanceof Error ? err.message : "Failed to send message")
      } finally {
        setIsLoading(false)
      }
    },
    [language, started, messages, selectedCity, selectedCountry, currentWeather, duration]
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
    const data = await fetchWeather(city)
    if (data) {
      if (window.innerWidth >= 1024) {
        setWeatherOpen(true)
      } else {
        setWeatherOpen(false)
      }
      if (!started) setStarted(true)
    }
  }

  const handleFamousPlaceSelect = async (city: string, countryCode: string) => {
    setSelectedCountry(countryCode)
    setSelectedCity(city)
    await handleLocationSelect(city)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white dark:bg-slate-950">
      {currentWeather && currentWeather.current && (
        <div className="lg:hidden border-b border-border bg-muted/20 relative flex-none">
          <button
            onClick={() => setWeatherOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 font-semibold"
          >
            <span>{currentWeather?.current?.city} Weather</span>
            {weatherOpen ? <ChevronUp /> : <ChevronDown />}
          </button>

          {weatherOpen && (
            <div className="absolute top-full left-1 right-1 z-[100] px-3 py-3 animate-in slide-in-from-top-2 overflow-y-auto max-h-[60vh] no-scrollbar bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-x border-b border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-b-2xl">
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
          <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 scroll-smooth min-h-0">
            {!started && messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8">
                <div className="w-full max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                      {labels.hero.title}
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
                      {labels.hero.description}
                    </p>
                  </div>

                  <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3 pt-4">
                    {labels.hero.details.map((detail, i) => (
                      <div key={i} className="flex gap-3 text-lg text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 items-start">
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
              <div className="space-y-6 py-6 max-w-5xl mx-auto">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} language={language} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-3 w-[90%] mx-auto flex-row">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 bg-purple-500">
                        <Cloud size={18} className="animate-pulse" />
                      </div>
                      <div className="rounded-2xl px-6 py-4 border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <div className="flex gap-1.5 order-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                        </div>
                        <span className="text-sm tracking-tight order-1 opacity-70">
                          {i18n[language].chatMessage.thinking}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="flex-none border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="p-4 md:px-6 lg:px-8">
              {showFamous && (
                <div className="max-w-5xl mx-auto w-full mb-3 animate-in slide-in-from-bottom-2 duration-300">
                  <FamousPlaces
                    language={language}
                    onSelect={handleFamousPlaceSelect}
                  />
                </div>
              )}
              <div className="flex flex-col-reverse lg:flex-row-reverse gap-3 max-w-5xl mx-auto w-full">
                <div className="flex-1 min-w-0 w-full lg:flex-[1.5]">
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
                    showFamous={showFamous}
                    onToggleFamous={() => setShowFamous(!showFamous)}
                    duration={duration}
                    onDurationChange={setDuration}
                  />
                </div>

                <div className={`w-full lg:w-auto lg:flex-[1] lg:max-w-[380px] ${showLocations ? "block" : "hidden lg:block"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
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
                    disabled={isLoading || weatherLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {currentWeather && currentWeather.current && (
          <div className="hidden lg:flex flex-none w-[420px] h-full bg-blue-50/50 dark:bg-slate-900 border-l border-blue-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 w-full min-h-full flex flex-col">
              <WeatherDisplay
                weatherData={currentWeather}
                language={language}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}