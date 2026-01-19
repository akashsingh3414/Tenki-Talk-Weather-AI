"use client"

import { MessageCircle, Cloud } from "lucide-react"
import { i18n, type Language } from "@/lib/i18n"
import ReactMarkdown from "react-markdown"

interface CurrentWeather {
  city: string
  country: string
  temp: number
  feels_like: number
  description: string
  details: string
  humidity: number
  wind_speed: number
}

interface Forecast {
  time: string
  temp: number
  description: string
}

interface Weather {
  current: CurrentWeather
  forecast: Forecast[]
}

import { TravelCard } from "@/components/travel_card"

interface TravelPlace {
  name: string
  description: string
  suitability: string
  details: string
  imageSearchQuery: string
  website?: string
  mapsUrl?: string
}

interface TravelJsonResponse {
  explanation: string
  places: TravelPlace[]
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  weather?: Weather
  timestamp: Date
  travelPlans?: TravelJsonResponse
}

interface ChatMessageProps {
  message: Message
  language: Language
}

export function ChatMessage({ message, language }: ChatMessageProps) {
  const isUser = message.type === "user"
  const labels = i18n[language].chatMessage

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`flex gap-3 w-[90%] mx-auto ${isUser ? "flex-row-reverse" : "flex-row"
          }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${isUser ? "bg-blue-500" : "bg-purple-500"
            }`}
        >
          {isUser ? <MessageCircle size={18} /> : <Cloud size={18} />}
        </div>

        <div className="flex flex-col gap-2 w-full overflow-hidden">
          <div
            className={`rounded-2xl px-6 py-4 shadow-sm border ${isUser
              ? "bg-blue-600 border-blue-500 text-white ml-auto"
              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              }`}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-base dark:prose-invert max-w-none prose-ul:pl-5 prose-ol:pl-5 prose-li:my-2 prose-headings:mb-4 prose-p:mb-4 leading-relaxed">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {message.travelPlans && message.travelPlans.places.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {message.travelPlans.places.map((place, idx) => (
                      <TravelCard key={idx} place={place} language={language} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>


          <span className="text-[11px] text-muted-foreground ml-1">
            {message.timestamp.toLocaleTimeString(
              language === "ja-JP" ? "ja-JP" : "en-US",
              { hour: "2-digit", minute: "2-digit" }
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

function getTempCardColor(temp: number) {
  if (temp <= 10)
    return "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800"
  if (temp <= 20)
    return "bg-teal-100 text-teal-900 border-teal-200 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800"
  if (temp <= 30)
    return "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
  return "bg-red-100 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
}

function Info({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
      {sub && (
        <p className="text-xs capitalize text-muted-foreground">{sub}</p>
      )}
    </div>
  )
}
