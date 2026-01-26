"use client"

import { useState, useEffect } from "react"
import { i18n, type Language } from "@/lib/i18n"
import { MapPin } from "lucide-react"
import { WeatherConditionIcon } from "./weather_display"
import { getWeather } from "@/app/actions"

interface FamousPlace {
    city: string
    country: string
    countryCode: string
}

interface PlaceWeather {
    city: string
    temp: number
    description: string
    countryCode: string
}

const PLACES: FamousPlace[] = [
    { city: "Tokyo", country: "Japan", countryCode: "JP" },
    { city: "Kyoto", country: "Japan", countryCode: "JP" },
    { city: "Osaka", country: "Japan", countryCode: "JP" },
    { city: "Okinawa", country: "Japan", countryCode: "JP" },
    { city: "Sapporo", country: "Japan", countryCode: "JP" },
    { city: "Paris", country: "France", countryCode: "FR" },
    { city: "London", country: "United Kingdom", countryCode: "GB" },
    { city: "New York", country: "USA", countryCode: "US" },
    { city: "Dubai", country: "UAE", countryCode: "AE" },
    { city: "Mumbai", country: "India", countryCode: "IN" },
]

export function FamousPlaces({
    language,
    onSelect
}: {
    language: Language
    onSelect: (city: string, countryCode: string) => void
}) {
    const [weatherData, setWeatherData] = useState<Record<string, PlaceWeather>>({})
    const [loading, setLoading] = useState(true)
    const t = i18n[language].famousPlaces

    useEffect(() => {
        const fetchAllWeather = async () => {
            setLoading(true)
            setWeatherData({})
            const results: Record<string, PlaceWeather> = {}

            try {
                await Promise.all(PLACES.map(async (place) => {
                    try {
                        const data = await getWeather(place.city, language)
                        if (data && data.current) {
                            results[place.city] = {
                                city: data.current.city,
                                temp: data.current.temp,
                                description: data.current.description,
                                countryCode: place.countryCode
                            }
                        }
                    } catch (_e) { }
                }))
                setWeatherData(results)
            } catch (_err) {
            } finally {
                setLoading(false)
            }
        }

        fetchAllWeather()
    }, [language])

    return (
        <div className="w-full space-y-4 pt-4 pb-2">
            <div className="flex items-center justify-between px-4 lg:px-0">
                <h3 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {t.title}
                </h3>
            </div>

            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth">
                {loading && Object.keys(weatherData).length === 0 ? (
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="min-w-[140px] lg:min-w-[160px] h-[80px] bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800" />
                        ))}
                    </div>
                ) : (
                    PLACES.map((place) => {
                        const weather = weatherData[place.city]
                        if (!weather) return null

                        const localizedCityName = (t.places as Record<string, string>)?.[place.city] || weather.city

                        return (
                            <button
                                key={place.city}
                                onClick={() => onSelect(place.city, place.countryCode)}
                                className="flex-none w-[140px] lg:w-[160px] p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all text-left group active:scale-95 shadow-sm"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {localizedCityName}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                                            {place.countryCode}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[18px] font-black text-slate-900 dark:text-white leading-tight">
                                                {Math.round(weather.temp)}°
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 truncate max-w-[80px]">
                                                {weather.description}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <WeatherConditionIcon
                                                condition={weather.description}
                                                size={18}
                                                className="text-blue-600 dark:text-blue-400 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
    )
}
