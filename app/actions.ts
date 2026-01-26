"use server"

import { fetchWeatherData } from "@/lib/weather"

const GEONAMES_USER = process.env.NEXT_PUBLIC_GEONAMES_USER

export async function getGeoNamesCountries() {
    if (!GEONAMES_USER) {
        throw new Error("GeoNames user not configured")
    }

    const res = await fetch(
        `https://secure.geonames.org/countryInfoJSON?username=${GEONAMES_USER}`
    )
    if (!res.ok) throw new Error("Failed to fetch countries")
    return await res.json()
}

export async function getGeoNamesCities(countryCode: string) {
    if (!GEONAMES_USER) {
        throw new Error("GeoNames user not configured")
    }

    const res = await fetch(
        `https://secure.geonames.org/searchJSON?username=${GEONAMES_USER}&country=${countryCode}&featureClass=P&maxRows=500&orderby=population`
    )
    if (!res.ok) throw new Error("Failed to fetch cities")
    return await res.json()
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
