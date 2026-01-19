"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Globe, ChevronDown } from "lucide-react"

type Language = "ja-JP" | "en-US" | "hi-IN"

interface LanguageSelectorProps {
  currentLanguage: Language
  onChange: (lang: Language) => void
}

export function LanguageSelector({ currentLanguage, onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: "ja-JP", name: "Japanese", nativeName: "日本語" },
    { code: "en-US", name: "English", nativeName: "English" },
    { code: "hi-IN", name: "Hindi", nativeName: "हिंदी" },
  ]

  const handleSelect = (lang: Language) => {
    onChange(lang)
    setIsOpen(false)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="ghost"
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
      >
        <Globe className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-sm">
          {languages.find((l) => l.code === currentLanguage)?.nativeName}
        </span>
        <ChevronDown className={`ml-2 h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
