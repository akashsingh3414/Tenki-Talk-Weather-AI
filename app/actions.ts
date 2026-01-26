"use server"

import { getGeoNamesCountries, getGeoNamesCities } from "@/lib/api/geonames"
import { fetchWeatherData } from "@/lib/api/weather"

export async function getCountries() {
    return getGeoNamesCountries()
}

export async function getCities(countryCode: string) {
    return getGeoNamesCities(countryCode)
}

export async function getWeather(city: string, language: string) {
    if (!city) {
        throw new Error("City is required")
    }

    const data = await fetchWeatherData(city, language)
    if (!data) {
        throw new Error("City not found")
    }

    return data
}
