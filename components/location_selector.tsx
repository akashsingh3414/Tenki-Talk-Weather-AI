"use client"

import React, { useEffect, useState, useRef } from "react"
import { ChevronDown, MapPin, Loader2, AlertTriangle, Check, Search } from "lucide-react"
import { i18n, type Language } from "@/lib/i18n"

interface Country {
  name: string
  code: string
}

interface City {
  id: string
  name: string
  countryCode: string
}

interface GeoNamesCountry {
  countryName: string
  countryCode: string
}

interface GeoNamesResponse<T> {
  geonames?: T[]
  status?: {
    message: string
    value: number
  }
}

interface LocationSelectorProps {
  language: Language
  selectedCountry: string
  selectedCity: string
  onCountryChange: (code: string) => void
  onCityChange: (name: string) => void
  disabled?: boolean
}

const GEONAMES_USER = process.env.NEXT_PUBLIC_GEONAMES_USER

function Tooltip({
  children,
  content,
  visible,
  onMouseEnter,
  onMouseLeave
}: {
  children: React.ReactNode,
  content: string,
  visible: boolean,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void
}) {
  return (
    <div
      className="relative flex flex-col items-center group w-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full mb-3 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none z-50">
          <div className="bg-slate-900/95 dark:bg-slate-800/98 backdrop-blur-xl text-white text-[13px] py-2.5 px-4 rounded-xl whitespace-nowrap shadow-2xl border border-white/20 font-medium flex items-center gap-2 ring-1 ring-black/5">
            <AlertTriangle size={14} className="text-amber-400" />
            {content}
          </div>
          <div className="w-3 h-3 bg-slate-900/95 dark:bg-slate-800/98 rotate-45 -mt-1.5 border-r border-b border-white/20" />
        </div>
      )}
    </div>
  )
}

export function LocationSelector({
  language,
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
  disabled,
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const [countrySearch, setCountrySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [isCountryOpen, setIsCountryOpen] = useState(false)
  const [isCityOpen, setIsCityOpen] = useState(false)

  const countryRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  const t = i18n[language].citySelector

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false)
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!GEONAMES_USER) return

    const fetchCountries = async () => {
      setLoadingCountries(true)
      try {
        const res = await fetch(
          `https://secure.geonames.org/countryInfoJSON?username=${GEONAMES_USER}`
        )
        const data: GeoNamesResponse<GeoNamesCountry> = await res.json()
        if (Array.isArray(data.geonames)) {
          const uniqueCountries = Array.from(
            new Map(
              data.geonames.map((c) => [
                c.countryCode,
                { name: c.countryName, code: c.countryCode },
              ])
            ).values()
          ).sort((a, b) => a.name.localeCompare(b.name))
          setCountries(uniqueCountries)
        }
      } catch (err) {
        console.error("Failed to fetch countries", err)
      } finally {
        setLoadingCountries(false)
      }
    }
    fetchCountries()
  }, [language])

  useEffect(() => {
    if (!selectedCountry || !GEONAMES_USER) {
      setCities([])
      return
    }

    const currentCountryName = countries.find(c => c.code === selectedCountry)?.name

    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const res = await fetch(
          `https://secure.geonames.org/searchJSON?username=${GEONAMES_USER}&country=${selectedCountry}&featureClass=P&maxRows=500&orderby=population`
        )
        const data: GeoNamesResponse<any> = await res.json()
        
        if (Array.isArray(data.geonames)) {
          const processedCities = data.geonames
            .filter((c: any) => {
              const nameLower = c.name.toLowerCase()
              const countryLower = currentCountryName?.toLowerCase()
              if (countryLower && (nameLower === countryLower || nameLower.includes("republic of") || nameLower.includes("kingdom of"))) {
                return false
              }
              return true
            })
            .map((c: any) => ({
              id: String(c.geonameId),
              name: c.name,
              countryCode: selectedCountry,
            }))

          const uniqueCities = Array.from(
            new Map(
              processedCities.map((c) => [c.id, c])
            ).values()
          ).sort((a, b) => a.name.localeCompare(b.name))
          
          setCities(uniqueCities)
        }
      } catch (err) {
        console.error("Failed to fetch cities", err)
      } finally {
        setLoadingCities(false)
      }
    }
    fetchCities()
  }, [selectedCountry, countries])

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  const currentCountryName = countries.find(c => c.code === selectedCountry)?.name || ""

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 w-full z-1000">
      <div className="relative w-full" ref={countryRef}>
        <div className="relative group">
          <input
            type="text"
            className="w-full h-12 pl-10 pr-10 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none shadow-sm transition-all text-slate-900 dark:text-white"
            placeholder={t.country}
            value={isCountryOpen ? countrySearch : currentCountryName}
            onChange={(e) => setCountrySearch(e.target.value)}
            onFocus={() => {
              setIsCountryOpen(true)
              setCountrySearch("")
            }}
            disabled={disabled || loadingCountries}
          />
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-pointer" onClick={(e) => {
            e.stopPropagation()
            if (!disabled && !loadingCountries) {
              setIsCountryOpen(!isCountryOpen)
              if (!isCountryOpen) setCountrySearch("")
            }
          }}>
            {loadingCountries ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCountryOpen ? "rotate-180" : ""}`} />
            )}
          </div>
        </div>

        {isCountryOpen && !loadingCountries && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[1000] max-h-[300px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2">
            {filteredCountries.length > 0 ? (
              <div className="p-2 py-1.5">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCountryChange(c.code)
                      onCityChange("")
                      setCountrySearch("")
                      setIsCountryOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <span>{c.name}</span>
                    {selectedCountry === c.code && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-400 font-medium">{t.noCountriesFound}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* City Selector */}
      <div className="relative w-full" ref={cityRef}>
        <Tooltip
          content={t.selectCountryFirst}
          visible={showTooltip && !selectedCountry}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="relative group w-full">
            <input
              type="text"
              className={`w-full h-12 pl-10 pr-10 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none shadow-sm transition-all text-slate-900 dark:text-white ${!selectedCountry ? "cursor-not-allowed opacity-60" : ""
                }`}
              placeholder={t.city}
              value={isCityOpen ? citySearch : selectedCity}
              onChange={(e) => setCitySearch(e.target.value)}
              onFocus={() => {
                if (selectedCountry) {
                  setIsCityOpen(true)
                  setCitySearch("")
                }
              }}
              disabled={disabled || !selectedCountry || loadingCities}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 ${selectedCountry ? "cursor-pointer" : "cursor-not-allowed"}`} onClick={(e) => {
              e.stopPropagation()
              if (!disabled && selectedCountry && !loadingCities) {
                setIsCityOpen(!isCityOpen)
                if (!isCityOpen) setCitySearch("")
              }
            }}>
              {loadingCities ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCityOpen ? "rotate-180" : ""}`} />
              )}
            </div>
          </div>
        </Tooltip>

        {isCityOpen && !loadingCities && selectedCountry && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[1000] max-h-[300px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2">
            {filteredCities.length > 0 ? (
              <div className="p-2 py-1.5">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      onCityChange(city.name)
                      setCitySearch("")
                      setIsCityOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <span>{city.name}</span>
                    {selectedCity === city.name && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2 py-1.5 text-center">
                <p className="text-sm text-slate-400 font-medium">{t.noCitiesFound}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}