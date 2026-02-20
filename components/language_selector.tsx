"use client"

import { useState, useRef, useContext } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, LanguagesIcon, Loader2 } from "lucide-react"
import { LanguageContext } from "@/lib/language_context"
import { type Language as I18nLanguage } from "@/lib/i18n"

type LocalLanguage = I18nLanguage

interface LanguageSelectorProps {
  currentLanguage: LocalLanguage
  onChange: (lang: LocalLanguage) => void
}

export function LanguageSelector({
  currentLanguage,
  onChange,
}: LanguageSelectorProps) {
  const { isTranslating, prepareTranslator, availability, checkAvailability } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false)
  const [loadingLanguage, setLoadingLanguage] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const languages = [
    { code: "en-US", nativeName: "English" },
    { code: "ja-JP", nativeName: "日本語" },
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
        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
      >
        <LanguagesIcon className={`w-4 h-4 mr-2 ${isTranslating ? "animate-pulse text-blue-500" : ""}`} />
        <span className="truncate">
          {languages.find((l) => l.code === currentLanguage)?.nativeName || currentLanguage}
          {isTranslating && "..."}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-[9999] p-1.5 animate-in fade-in zoom-in-95 duration-200">
          {languages.map(lang => {
            const isSelected = currentLanguage === lang.code;

            return (
              <button
                key={lang.code}
                onClick={async () => {
                  if (lang.code !== currentLanguage) {
                    setLoadingLanguage(lang.code);
                    try {
                      await prepareTranslator(lang.code as any);
                      onChange(lang.code);
                      await checkAvailability();
                    } finally {
                      setLoadingLanguage(null);
                    }
                  }
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all flex items-center justify-between group
                  ${isSelected
                    ? "bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.nativeName}</span>
                  {loadingLanguage === lang.code && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div >
  )
}
