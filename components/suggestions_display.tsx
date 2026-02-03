"use client"

import { Card } from "@/components/ui/card"

import { type Language } from "@/lib/i18n"
import { LanguageContext } from "@/lib/language_context"
import { useContext } from "react"

interface SuggestionsDisplayProps {
  suggestions: string
  language: Language
}

export function SuggestionsDisplay({ suggestions, language }: SuggestionsDisplayProps) {
  const { dictionary } = useContext(LanguageContext)
  const lines = suggestions.split("\n").filter((line) => line.trim())

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <h3 className="text-2xl font-bold mb-4 text-foreground">{dictionary.common?.aiSuggestions || "AI Suggestions"}</h3>

      <div className="space-y-4">
        {lines.map((line, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {idx + 1}
            </div>
            <p className="flex-1 text-foreground leading-relaxed">{line}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6 italic">
        {dictionary.common?.suggestionsNote || "Suggestions are based on weather data and AI analysis"}
      </p>
    </Card>
  )
}
