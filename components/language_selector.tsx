"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Globe, ChevronDown } from "lucide-react"

type Language = "ja-JP" | "en-US" | "hi-IN"

interface LanguageSelectorProps {
  currentLanguage: Language
  onChange: (lang: Language) => void
}

export function LanguageSelector({
  currentLanguage,
  onChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const languages = [
    { code: "ja-JP", nativeName: "日本語" },
    { code: "en-US", nativeName: "English" },
    { code: "hi-IN", nativeName: "हिंदी" },
  ] as const

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200)
  }

  return (
    <div
      className="relative overflow-visible"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="ghost"
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <Globe className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium">
          {languages.find(l => l.code === currentLanguage)?.nativeName}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white dark:bg-gray-800 shadow-lg z-[9999]">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
