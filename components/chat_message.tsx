"use client"

import { User, Loader2 } from "lucide-react"
import { type Language } from "@/lib/i18n"
import ReactMarkdown from "react-markdown"
import { TravelCard } from "@/components/travel_card"
import Image from "next/image"
import logo from "@/app/icon.png"
import { Message } from "@/lib/types"

import { LanguageContext } from "@/lib/language_context"
import { useContext, useState, useEffect } from "react"
import { BrowserAI } from "@/lib/translation_utils"

interface ChatMessageProps {
  message: Message
  language: Language
}

export function ChatMessage({ message, language }: ChatMessageProps) {
  const { translate, translateObject } = useContext(LanguageContext)
  const [translatedContent, setTranslatedContent] = useState(message.content)
  const [translatedTravelPlans, setTranslatedTravelPlans] = useState(message.travelPlans)
  const [isTranslatingMsg, setIsTranslatingMsg] = useState(false)
  const isUser = message.type === "user"

  useEffect(() => {
    const doTranslate = async () => {
      const targetTag = language.includes("-") ? language.split("-")[0] : language

      setIsTranslatingMsg(true)

      try {
        // Initialize promises
        let plansPromise = Promise.resolve(message.travelPlans)
        const contentPromise = translate(message.content)

        if (message.travelPlans && message.travelPlans.places.length > 0) {
          const translator = await BrowserAI.createTranslator("en", targetTag)
          plansPromise = translateObject(message.travelPlans, targetTag, translator)
          // The translator will be destroyed inside translateObject or we can do it after
        }

        const [newContent, newPlans] = await Promise.all([contentPromise, plansPromise])

        setTranslatedContent(newContent)
        setTranslatedTravelPlans(newPlans)
      } catch (e) {
        console.error("[ChatMessage] Translation failed:", e)
      } finally {
        setIsTranslatingMsg(false)
      }
    }

    // Always reset to original content first to avoid stale UI
    setTranslatedContent(message.content)
    if (message.travelPlans) setTranslatedTravelPlans(message.travelPlans)

    doTranslate()
  }, [language, message.content, message.travelPlans, translate, translateObject, isUser])

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`flex gap-3 w-full mx-auto ${isUser ? "flex-row-reverse" : "flex-row"
          }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden ${isUser ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-900 shadow-inner"
            }`}
        >
          {isUser ? (
            <User size={18} />
          ) : (
            <Image
              src={logo}
              alt="AI"
              width={36}
              height={36}
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-2 w-full overflow-hidden">
          <div
            className={`rounded-2xl px-6 py-4 shadow-sm border ${isUser
              ? "bg-blue-600 border-blue-500 text-white ml-auto"
              : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              }`}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{translatedContent}</p>
            ) : (
              <div className="space-y-4">
                <div className="prose prose-base dark:prose-invert max-w-none prose-ul:pl-5 prose-ol:pl-5 prose-li:my-2 prose-headings:mb-4 prose-p:mb-4 leading-relaxed">
                  <ReactMarkdown>{translatedContent}</ReactMarkdown>
                  {isTranslatingMsg && <Loader2 className="w-3 h-3 animate-spin opacity-50" />}
                </div>

                {translatedTravelPlans && translatedTravelPlans.places.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {translatedTravelPlans.places.map((place, idx) => (
                      <TravelCard key={idx} place={place} language={language} />
                    ))}
                  </div>
                )}

                {translatedTravelPlans?.closing && (
                  <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                    {translatedTravelPlans.closing}
                  </p>
                )}
              </div>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground ml-1">
            {message.timestamp.toLocaleTimeString(
              language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
              { hour: "2-digit", minute: "2-digit" }
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
