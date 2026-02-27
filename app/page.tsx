"use client"

import { useState, useRef, useEffect, useCallback, useContext } from "react"
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { type Language } from "@/lib/i18n"
import { useTranscriber } from "./hooks/useTranscriber"
import { WeatherDisplay } from "@/components/weather_display"
import { ChatInput } from "@/components/chat_input"
import { Button } from "@/components/ui/button"
import { FamousPlaces } from "@/components/famous_places"
import { useWeather } from "./hooks/useWeather"
import { LanguageContext } from "@/lib/language_context"
import { HeroSection } from "@/components/hero_section"
import { ChatDisplay } from "@/components/chat_display"
import { WeatherSidebar } from "@/components/weather_sidebar"
import { LocationSelector } from "@/components/location_selector"
import { LandingView } from "@/components/landing_view"
import logo from "@/app/icon.png"
import { Message } from "@/lib/types"
import { useLanguageDetection } from "./hooks/useLanguageDetection"
import { useAuth } from "@/lib/auth_context"

export default function Home() {
  const { language, resetTrigger, dictionary } = useContext(LanguageContext)
  const [messages, setMessages] = useState<Message[]>([])
  const [started, setStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatError, setChatError] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [weatherOpen, setWeatherOpen] = useState(false)
  const [showLocations, setShowLocations] = useState(false)
  const [showFamous, setShowFamous] = useState(false)
  const [duration, setDuration] = useState(1)
  const [welcomeIndex, setWelcomeIndex] = useState<number | null>(null)
  const { detectLanguage } = useLanguageDetection()

  const {
    weatherData: currentWeather,
    loading: weatherLoading,
    error: _weatherError,
    fetchWeather,
    setWeatherData: setCurrentWeather
  } = useWeather(language)

  const auth = useAuth()
  const user = auth.user


  useEffect(() => {
    if (resetTrigger > 0) {
      setMessages([])
      setStarted(false)
      setIsLoading(false)
      setChatError("")
      setSelectedCountry("")
      setSelectedCity("")
      setChatInput("")
      setWeatherOpen(false)
      setShowLocations(false)
      setShowFamous(false)
      setCurrentWeather(null)
      setWelcomeIndex(null)
    }
  }, [resetTrigger, setCurrentWeather])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const transcriber = useTranscriber()

  useEffect(() => {
    if (started && messages.length === 0) {
      const welcomeMessages = dictionary.home.welcome
      const index = Math.floor(Math.random() * welcomeMessages.length)
      setWelcomeIndex(index)
      setMessages([
        {
          id: "0",
          type: "ai",
          content: welcomeMessages[index],
          timestamp: new Date(),
        },
      ])
    }
  }, [started, messages.length, language, dictionary.home.welcome])

  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === "0" && welcomeIndex !== null) {
          return { ...msg, content: dictionary.home.welcome[welcomeIndex] }
        }
        if (msg.id.endsWith("-warning")) {
          return { ...msg, content: dictionary.citySelector.selectCityAIWarning }
        }
        return msg
      })
    )
  }, [language, welcomeIndex, dictionary.home.welcome, dictionary.citySelector.selectCityAIWarning])

  const handleSendMessage = useCallback(
    async (userMessage: string, detectedLanguage?: string | null) => {
      if (!userMessage.trim()) return
      if (!selectedCity) {
        const aiWarning: Message = {
          id: Date.now().toString() + "-warning",
          type: "ai",
          content: dictionary.citySelector.selectCityAIWarning,
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
        language: (detectedLanguage as Language) || language
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
            language: detectedLanguage || language,
            history: chatHistory,
            duration: Math.min(Math.max(1, duration), 5),
          }),
        })

        const data = await res.json()
        const suggestions = data.suggestions

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: suggestions?.explanation || (typeof suggestions === "string" ? suggestions : ""),
          travelPlans: suggestions?.places ? suggestions : undefined,
          timestamp: new Date(),
          language: (detectedLanguage as Language) || language
        };

        setMessages((prev) => [...prev, aiMsg])
      } catch (err: any) {
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
    [language, started, messages, selectedCity, selectedCountry, currentWeather, duration, dictionary.citySelector.selectCityAIWarning, user]
  )

  const handleAudioSubmit = useCallback(
    async (audioBlob: Blob) => {
      if (!transcriber) return
      await transcriber.stopLive(audioBlob)
    },
    [transcriber]
  )

  useEffect(() => {
    const handleVoice = async () => {
      if (transcriber.output?.text) {
        const detected = await detectLanguage(transcriber.output.text)
        handleSendMessage(transcriber.output.text, detected)
        transcriber.onInputChange()
      }
    }
    handleVoice()
  }, [transcriber.output, handleSendMessage, transcriber, detectLanguage])

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
  }, [messages.length])

  if (auth.loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium animate-pulse">Initializing Tenki Talk...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white dark:bg-slate-950">
      {user && currentWeather && currentWeather.current && (
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
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 lg:px-8 scroll-smooth min-h-0 pb-0">
            {!started && messages.length === 0 ? (
              <LandingView logo={logo} user={user} onLogin={() => auth.login()} />
            ) : (
              <ChatDisplay
                messages={messages}
                isLoading={isLoading}
                language={language}
                messagesEndRef={messagesEndRef}
                logo={logo}
              />
            )}
          </div>

          {user && (
            <div className="flex-none bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-300 dark:border-slate-800 px-2 sm:px-4 py-2 sm:py-4">
              {showFamous && (
                <div className="max-w-5xl mx-auto mb-2 sm:mb-3 animate-in slide-in-from-bottom-4 duration-500">
                  <FamousPlaces
                    language={language}
                    onSelect={handleFamousPlaceSelect}
                  />
                </div>
              )}

              <div className="max-w-5xl mx-auto relative">
                <div className="flex flex-col-reverse lg:flex-row-reverse gap-2 sm:gap-3 items-end">
                  <div className="flex-1 w-full lg:min-w-0">
                    <ChatInput
                      value={chatInput}
                      onChange={setChatInput}
                      onSendMessage={(val: string) => handleSendMessage(val)}
                      isLoading={isLoading}
                      onAudioRecorded={handleAudioSubmit}
                      language={language}
                      transcriber={transcriber}
                      currentCity={selectedCity}
                      showLocations={showLocations}
                      onToggleLocations={() => setShowLocations(!showLocations)}
                      showFamous={showFamous}
                      onToggleFamous={() => setShowFamous(!showFamous)}
                      duration={duration}
                      onDurationChange={setDuration}
                    />
                  </div>

                  <div className={`w-full lg:w-72 xl:w-80 flex-none ${showLocations ? "block" : "hidden lg:block"}`}>
                    <div className="backdrop-blur-md rounded-2xl border-none lg:p-0 p-2 shadow-sm lg:shadow-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <LocationSelector
                        language={language}
                        selectedCountry={selectedCountry}
                        selectedCity={selectedCity}
                        onCountryChange={(country: string) => {
                          setSelectedCountry(country)
                          setSelectedCity("")
                          setCurrentWeather(null)
                        }}
                        onCityChange={(city: string) => {
                          setSelectedCity(city)
                          if (city) {
                            handleLocationSelect(city)
                            setShowLocations(false)
                          }
                        }}
                        disabled={isLoading || weatherLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {user && <WeatherSidebar weatherData={currentWeather} language={language} />}
      </div>
    </div>
  )
}