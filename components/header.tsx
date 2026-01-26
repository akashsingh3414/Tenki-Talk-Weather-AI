"use client"

import * as React from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language_selector"
import { useTheme } from "@/components/theme_provider"
import { i18n } from "@/lib/i18n"


import Image from "next/image"
import { useContext } from "react"
import { LanguageContext } from "@/lib/language_context"
import logo from "@/app/icon.png"

export function Header() {
  const { language, setLanguage, triggerReset } = useContext(LanguageContext);
  const onLanguageChange = setLanguage;
  const onHomeClick = triggerReset;
  const currentCity = "";
  const label = i18n[language].header

  return (
    <header className="relative sticky z-[1000] overflow-visible bg-white dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="hidden md:flex items-center justify-between gap-4 py-3 lg:py-4">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2 transition-all hover:opacity-80 active:scale-95"
          >
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 shadow-inner">
              <Image
                src={logo}
                alt="Tenki Talk Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-lg lg:text-2xl font-bold tracking-tight">
              {label.title}
            </span>
          </button>

          <div className="flex-1 flex justify-center">
            <span className="text-base lg:text-lg font-semibold">
              {currentCity || ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguage={language}
              onChange={onLanguageChange}
            />
            <ThemeToggle />
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center justify-between py-3">
            <button
              onClick={onHomeClick}
              className="flex items-center gap-2.5 transition-all hover:opacity-80 active:scale-95"
            >
              <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 shadow-inner">
                <Image
                  src={logo}
                  alt="Tenki Talk Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight">
                {label.title}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <LanguageSelector
                currentLanguage={language}
                onChange={onLanguageChange}
              />
              <ThemeToggle />
            </div>
          </div>

          <div className="pb-3 text-center">
            <span className="text-base sm:text-lg font-semibold">
              {currentCity || ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-9 w-9" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="hover:text-blue-600 dark:hover:text-blue-400"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  )
}
