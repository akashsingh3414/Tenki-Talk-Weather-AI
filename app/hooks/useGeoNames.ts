"use client"

import { useState, useEffect, useCallback } from 'react'
import { getCountries, getCities } from '@/app/actions'

export interface GeoNamesCountry {
    countryCode: string
    countryName: string
}

export interface GeoNamesCity {
    geoNameId: string
    name: string
    lat?: string
    lng?: string
    countryCode?: string
}

export function useGeoNames() {
    const [countries, setCountries] = useState<GeoNamesCountry[]>([])
    const [cities, setCities] = useState<GeoNamesCity[]>([])
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [loadingCities, setLoadingCities] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCountries = useCallback(async () => {
        setLoadingCountries(true)
        setError(null)
        try {
            const data = await getCountries()
            if (Array.isArray(data.geonames)) {
                const sortedCountries = data.geonames.sort((a: GeoNamesCountry, b: GeoNamesCountry) =>
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
            const data = await getCities(countryCode)
            if (Array.isArray(data.geonames)) {
                const processedCities = data.geonames
                    .map((c: GeoNamesCity) => ({
                        geoNameId: c.geoNameId ? String(c.geoNameId) : `${c.name}-${c.lat}-${c.lng}`,
                        name: c.name,
                        lat: c.lat,
                        lng: c.lng,
                        countryCode: countryCode
                    }))
                    .sort((a: GeoNamesCity, b: GeoNamesCity) => a.name.localeCompare(b.name))
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
