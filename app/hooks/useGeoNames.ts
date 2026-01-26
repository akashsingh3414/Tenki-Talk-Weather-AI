"use client"

import { useState, useEffect, useCallback } from 'react'
import { Language } from '@/lib/i18n'
import { getGeoNamesCountries, getGeoNamesCities } from '@/app/actions'

export interface GeoNamesCountry {
    countryCode: string
    countryName: string
}

export interface GeoNamesCity {
    id: string
    name: string
    lat?: string
    lng?: string
    countryCode?: string
}

export function useGeoNames(language: Language) {
    const [countries, setCountries] = useState<GeoNamesCountry[]>([])
    const [cities, setCities] = useState<GeoNamesCity[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingCities, setLoadingCities] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCountries = useCallback(async () => {
        setLoadingCountries(true)
        setError(null)
        try {
            const data = await getGeoNamesCountries()
            if (Array.isArray(data.geonames)) {
                const sortedCountries = data.geonames.sort((a: any, b: any) =>
                    a.countryName.localeCompare(b.countryName)
                )
                setCountries(sortedCountries)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoadingCountries(false)
        }
    }, [])

    const fetchCities = useCallback(async (countryCode: string) => {
        if (!countryCode) {
            setCities([])
            return
        }
        setLoadingCities(true)
        setError(null)
        try {
            const data = await getGeoNamesCities(countryCode)
            if (Array.isArray(data.geonames)) {
                const processedCities = data.geonames
                    .map((c: any) => ({
                        id: String(c.geonameId),
                        name: c.name,
                        lat: c.lat,
                        lng: c.lng,
                        countryCode: countryCode
                    }))
                    .sort((a: any, b: any) => a.name.localeCompare(b.name))
                setCities(processedCities)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoadingCities(false)
        }
    }, [])

    useEffect(() => {
        fetchCountries()
    }, [fetchCountries])

    return {
        countries,
        cities,
        loadingCountries,
        loadingCities,
        error,
        fetchCities,
        refreshCountries: fetchCountries
    }
}
