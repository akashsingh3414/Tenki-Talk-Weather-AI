import React, { useEffect, useState, useRef } from "react"
import { ChevronDown, MapPin, Loader2, AlertTriangle, Check, Search } from "lucide-react"
import { i18n, type Language } from "@/lib/i18n"
import { useGeoNames } from "@/app/hooks/useGeoNames"

interface LocationSelectorProps {
  language: Language
  selectedCountry: string
  selectedCity: string
  onCountryChange: (code: string) => void
  onCityChange: (name: string) => void
  disabled?: boolean
}

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
  const {
    countries,
    cities,
    loadingCountries,
    loadingCities,
    fetchCities
  } = useGeoNames()

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
    fetchCities(selectedCountry)
  }, [selectedCountry, fetchCities])

  const filteredCountries = countries.filter(c =>
    c.countryName.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  const currentCountryName = countries.find(c => c.countryCode === selectedCountry)?.countryName || ""

  return (
    <div className="flex lg:flex-row gap-3 w-full z-1000">
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
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md z-[1000] max-h-[300px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2">
            {filteredCountries.length > 0 ? (
              <div className="p-2 py-1.5">
                {filteredCountries.map((c) => (
                  <button
                    key={c.countryCode}
                    onClick={() => {
                      onCountryChange(c.countryCode)
                      onCityChange("")
                      setCountrySearch("")
                      setIsCountryOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <span>{c.countryName}</span>
                    {selectedCountry === c.countryCode && <Check className="w-4 h-4 text-blue-600" />}
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
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-md z-[1000] max-h-[300px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-2">
            {filteredCities.length > 0 ? (
              <div className="p-2 py-1.5">
                {filteredCities.map((city) => (
                  <button
                    key={city.geoNameId}
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
