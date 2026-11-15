"use server"

import { getGeoNamesCountries, getGeoNamesCities } from "@/src/api/geonames"
import { fetchWeatherData } from "@/src/api/weather"

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
