"use client"

import { WeatherDisplay } from "./weather_display"
import { Language } from "@/lib/i18n"
import { WeatherData } from "@/lib/types"

interface WeatherSidebarProps {
    weatherData: WeatherData | null
    language: Language
}

export function WeatherSidebar({ weatherData, language }: WeatherSidebarProps) {
    if (!weatherData) return null

    return (
        <div className="hidden lg:flex w-[30%] flex-col overflow-hidden bg-slate-50/30 dark:bg-slate-900/10 shrink-0">
            <div className="flex-1 overflow-y-auto p-3 no-scrollbar scroll-smooth">
                <WeatherDisplay
                    weatherData={weatherData}
                    language={language}
                    isVertical={true}
                />
            </div>
        </div>
    )
}
