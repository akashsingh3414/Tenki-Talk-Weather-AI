"use client"
import * as React from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language_selector"
import { useTheme } from "@/components/theme_provider"
import { i18n, type Language } from "@/lib/i18n"
import { getTempColor } from "@/lib/weather_colors"

interface HeaderProps {
  language: Language
  onLanguageChange: (lang: Language) => void
  onHomeClick: () => void
  currentCity?: string
  temperature?: number
}

export function Header({
  language,
  onLanguageChange,
  onHomeClick,
  currentCity,
  temperature,
}: HeaderProps) {
  const label = i18n[language].header
  const style = getTempColor(temperature)

  return (
    <header className="flex-none bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-50 text-slate-900 dark:text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="hidden md:flex items-center justify-between gap-3 lg:gap-4 py-3 lg:py-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onHomeClick}
              className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:cursor-pointer transition-colors"
            >
              {label.title}
            </button>
          </div>

          <div className="flex-1 max-w-md lg:max-w-lg mx-4 lg:mx-8">
            <div className="flex items-center justify-center">
              <span className="text-base lg:text-lg font-semibold text-slate-900 dark:text-white">
                {currentCity || ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <LanguageSelector currentLanguage={language} onChange={onLanguageChange} />
            <ThemeToggle />
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2 py-3">
            <button
              onClick={onHomeClick}
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:cursor-pointer transition-colors flex-shrink-0"
            >
              {label.title}
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              <LanguageSelector currentLanguage={language} onChange={onLanguageChange} />
              <ThemeToggle />
            </div>
          </div>

          <div className="pb-3">
            <div className="flex items-center justify-center">
              <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                {currentCity || ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-9 w-9" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 flex-shrink-0"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  )
}