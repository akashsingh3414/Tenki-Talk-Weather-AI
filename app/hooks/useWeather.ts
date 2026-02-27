"use client"

import { useState, useCallback } from 'react'
import { WeatherData } from '@/lib/types'
import { Language } from '@/lib/i18n'
import { getWeather } from '@/app/actions'

export function useWeather(language: Language) {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchWeather = useCallback(async (city: string) => {
        if (!city) return
        setLoading(true)
        setError(null)
        try {
            const data = await getWeather(city, language)
            setWeatherData(data)
            return data
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            setError(msg)
            return null
        } finally {
            setLoading(false)
        }
    }, [language])

    return {
        weatherData,
        loading,
        error,
        fetchWeather,
        setWeatherData
    }
}
