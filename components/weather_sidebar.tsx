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
        <div className="hidden lg:flex w-[30%] max-w-md h-[calc(100vh-64px)] flex-col overflow-hidden bg-slate-50/30 dark:bg-slate-900/10 shrink-0 sticky top-16 items-center justify-center border-l dark:border-slate-800/50">
            <div className="w-full max-h-full overflow-y-auto p-4 no-scrollbar scroll-smooth">
                <WeatherDisplay
                    weatherData={weatherData}
                    language={language}
                    isVertical={true}
                />
            </div>
        </div>
    )
}
