"use client"

import * as React from "react"
import { i18n, type Language } from "@/lib/i18n"
import { LanguageContext } from "@/lib/language_context"
import { useContext } from "react"
import { getTempColor, TempColorStyle } from "@/lib/weather_colors"
import {
  Droplets,
  Wind,
  Gauge,
  Cloud,
  Eye,
  Sunrise,
  Sunset,
  Thermometer,
  Sun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  CloudDrizzle
} from "lucide-react"

import { WeatherData, Forecast, CurrentWeather } from "@/lib/types"

type WeatherDisplayLabels = typeof i18n["en-US"]["weatherDisplay"]

interface WeatherDisplayProps {
  weatherData: WeatherData
  language: Language
  isVertical?: boolean
}

export function WeatherDisplay({ weatherData, language, isVertical = false }: WeatherDisplayProps) {
  const { dictionary, translate } = useContext(LanguageContext)
  const labels = dictionary.weatherDisplay
  const { current, forecast } = weatherData || {}

  const groupedForecast = React.useMemo(() => {
    if (!forecast) return {}
    const groups: Record<string, Forecast[]> = {}
    forecast.forEach(item => {
      const date = item.time.split(' ')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    })
    return groups
  }, [forecast])

  const dates = Object.keys(groupedForecast)
  const [selectedDate, setSelectedDate] = React.useState<string>(dates[0] || "")

  React.useEffect(() => {
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0])
    }
  }, [dates, selectedDate])

  const containerClassName = `flex flex-col w-full gap-2 ${isVertical ? "h-full" : ""}`
  if (!weatherData || !weatherData.current || !current) return null

  return (
    <div className={containerClassName}>
      <div className="flex-none">
        <CurrentWeatherCard
          current={current}
          labels={labels}
          translate={translate}
          language={language}
        />
      </div>

      {forecast && forecast.length > 0 && (
        <div className="flex-1 min-h-0">
          <ForecastSection
            groupedForecast={groupedForecast}
            dates={dates}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            labels={labels}
            language={language}
            dictionary={dictionary}
          />
        </div>
      )}
    </div>
  )
}

function CurrentWeatherCard({
  current,
  labels,
  translate,
  language
}: {
  current: CurrentWeather,
  labels: WeatherDisplayLabels,
  translate: (text: string) => Promise<string>,
  language: Language
}) {
  const [translatedDetails, setTranslatedDetails] = React.useState(current.details || "")
  const [translatedVisibilityLevel, setTranslatedVisibilityLevel] = React.useState("")
  const [translatedCity, setTranslatedCity] = React.useState(current.city || "")
  const currentStyle = getTempColor(current.temp)

  const visibilityLevel = React.useMemo(() => current.visibility
    ? (current.visibility >= 10000 ? labels.visibilityExcellent
      : current.visibility >= 5000 ? labels.visibilityGood
        : current.visibility >= 2000 ? labels.visibilityModerate
          : labels.visibilityPoor)
    : null, [current.visibility, labels])

  React.useEffect(() => {
    const translateDynamicFields = async () => {
      const [details, visibility, city] = await Promise.all([
        translate(current.details),
        visibilityLevel ? translate(visibilityLevel) : Promise.resolve(""),
        translate(current.city),
      ])
      setTranslatedDetails(details)
      setTranslatedVisibilityLevel(visibility)
      setTranslatedCity(city)
    }
    translateDynamicFields()
  }, [current.details, current.city, visibilityLevel, translate, language])

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp * 1000).toLocaleTimeString(
      language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
  }

  const sunriseTime = formatTime(current.sunrise)
  const sunsetTime = formatTime(current.sunset)
  const visibilityKm = current.visibility ? (current.visibility / 1000).toFixed(1) : null

  return (
    <div className={`${currentStyle.bg} border ${currentStyle.border} rounded-xl p-3 sm:p-4 shadow-lg transition-colors duration-500`}>
      <div className={`flex items-start justify-between mb-2 ${currentStyle.text}`}>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {translatedCity}
          </h2>
          <p className="text-lg opacity-80 font-medium">
            {current.country}
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl sm:text-4xl font-black">
            {Math.round(current.temp)}°C
          </p>
          <p className="text-sm sm:text-base opacity-75 font-semibold flex items-center justify-end gap-1">
            {labels.feelsLike}:
            <Thermometer size={14} className="opacity-80" />
            {Math.round(current.feels_like)}°
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <WeatherConditionIcon
            condition={current.description}
            size={40}
            className={currentStyle.text}
          />
          <p className={`text-base font-bold capitalize px-4 py-1.5 rounded-full bg-black/10 dark:bg-white/10 w-fit ${currentStyle.text}`}>
            {translatedDetails}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {sunriseTime && (
            <div className={`flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold ${currentStyle.text}`}>
              <Sunrise size={14} className="opacity-80" />
              <span>{sunriseTime}</span>
            </div>
          )}
          {sunsetTime && (
            <div className={`flex items-center gap-2 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold ${currentStyle.text}`}>
              <Sunset size={14} className="opacity-80" />
              <span>{sunsetTime}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Stat icon={<Droplets size={14} />} label={labels.humidity} value={`${current.humidity}%`} style={currentStyle} />
        <Stat icon={<Wind size={14} />} label={labels.windSpeed} value={`${current.wind_speed} m/s`} style={currentStyle} />
        <Stat icon={<Gauge size={14} />} label={labels.pressure} value={`${current.pressure} hPa`} style={currentStyle} />
        <Stat icon={<Cloud size={14} />} label={labels.cloudCover} value={`${current.clouds}%`} style={currentStyle} />
        {visibilityKm && (
          <Stat
            icon={<Eye size={14} />}
            label={labels.visibility}
            value={`${visibilityKm}km`}
            subtitle={translatedVisibilityLevel || undefined}
            style={currentStyle}
          />
        )}
      </div>
    </div>
  )
}

function ForecastSection({
  groupedForecast,
  dates,
  selectedDate,
  setSelectedDate,
  labels,
  language,
  dictionary
}: {
  groupedForecast: Record<string, Forecast[]>,
  dates: string[],
  selectedDate: string,
  setSelectedDate: (date: string) => void,
  labels: WeatherDisplayLabels,
  language: Language,
  dictionary: typeof i18n["en-US" | "ja-JP" | "hi-IN"]
}) {
  const displayedForecast = groupedForecast[selectedDate] || []

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const common = dictionary.common

    if (date.toDateString() === today.toDateString()) {
      return common.today
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return common.tomorrow
    }
    return date.toLocaleDateString(
      language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
      { weekday: "short", day: "numeric" }
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col h-full transition-all">
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <span className="font-bold text-base flex items-center gap-2">
          <CloudRain size={18} className="text-primary" />
          {labels.forecast}
        </span>
        <span className="text-xs opacity-60 font-medium">{labels.forecastHint}</span>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={cn(
              "flex-none text-[11px] font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap border",
              selectedDate === date
                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
            )}
          >
            {formatDateLabel(date)}
          </button>
        ))}
      </div>

      <div
        className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-2 pb-1 no-scrollbar"
      >
        {Array.from({ length: Math.ceil(displayedForecast.length / 2) }).map((_, groupIdx) => (
          <div
            key={groupIdx}
            className="grid grid-cols-2 gap-2 flex-none w-full snap-start"
          >
            {displayedForecast.slice(groupIdx * 2, groupIdx * 2 + 2).map((item, idx) => (
              <ForecastCard key={idx} item={item} language={language} labels={labels} isCompact={true} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function WeatherConditionIcon({ condition, size = 24, className }: { condition: string, size?: number, className?: string }) {
  const c = condition.toLowerCase()

  if (c.includes("clear") || c.includes("sky")) return <Sun size={size} className={className} />
  if (c.includes("thunderstorm")) return <CloudLightning size={size} className={className} />
  if (c.includes("drizzle")) return <CloudDrizzle size={size} className={className} />
  if (c.includes("rain")) return <CloudRain size={size} className={className} />
  if (c.includes("snow")) return <Snowflake size={size} className={className} />
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return <CloudFog size={size} className={className} />
  if (c.includes("cloud")) return <Cloud size={size} className={className} />

  return <Sun size={size} className={className} />
}

function ForecastCard({ item, language, labels, isCompact = false }: { item: Forecast, language: Language, labels: WeatherDisplayLabels, isCompact?: boolean }) {
  const { translate } = useContext(LanguageContext)
  const [translatedDescription, setTranslatedDescription] = React.useState(item.description)

  React.useEffect(() => {
    const doTranslate = async () => {
      const translated = await translate(item.description)
      setTranslatedDescription(translated)
    }
    doTranslate()
  }, [item.description, translate, language])

  const itemStyle = getTempColor(item.temp)
  const time = item.time
    ? new Date(item.time).toLocaleTimeString(
      language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
    : "--:--"

  return (
    <div className={cn(
      itemStyle.bg,
      "border",
      itemStyle.border,
      "rounded-xl p-3 flex flex-col h-full transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
    )}>
      <div className={cn(itemStyle.text, "flex-shrink-0")}>
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs font-bold opacity-80">{time}</p>
          <div className="flex items-center gap-1 opacity-70">
            <Thermometer size={11} />
            <p className="text-[11px] font-bold">
              {Math.round(item.feels_like)}°
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1 mb-2">
          <div className="flex items-center gap-2">
            <WeatherConditionIcon condition={item.description} size={isCompact ? 22 : 26} />
            <p className={cn("font-black tracking-tighter", isCompact ? "text-lg" : "text-xl")}>
              {Math.round(item.temp)}°
            </p>
          </div>
          <p className="text-[11px] font-bold capitalize opacity-90 leading-tight line-clamp-2 text-right">
            {translatedDescription}
          </p>
        </div>
      </div>

      <hr className={cn("border-t", itemStyle.text, "opacity-10 my-2")} />

      <div className={cn("grid grid-cols-1 gap-y-1.5 mt-auto", itemStyle.text)}>
        <StatSmall icon={<Droplets size={10} />} label={labels.humidity} value={`${item.humidity}%`} />
        <StatSmall icon={<Wind size={10} />} label={labels.windSpeed} value={`${Math.round(item.wind_speed)}m/s`} />
        {item.pop > 0 && (
          <StatSmall icon={<CloudRain size={10} />} label={labels.pop} value={`${Math.round(item.pop * 100)}%`} />
        )}
      </div>
    </div>
  )
}

function StatSmall({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 opacity-80">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="flex-none opacity-70">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider truncate opacity-70">{label}</span>
      </div>
      <span className="text-[11px] font-black whitespace-nowrap">{value}</span>
    </div>
  )
}

function Stat({
  label,
  value,
  subtitle,
  style,
  icon
}: {
  label: string;
  value: string;
  subtitle?: string;
  style: TempColorStyle;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-white/5 rounded-lg p-2.5 flex flex-col items-start min-w-0 transition-all hover:bg-black/10 dark:hover:bg-white/10 group">
      <div className="flex items-center gap-2 mb-1.5 w-full">
        {icon && <span className="opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>}
        <p className="text-[9px] uppercase font-bold opacity-60 tracking-widest truncate">
          {label}
        </p>
      </div>
      <p className={cn("text-sm lg:text-base font-black truncate w-full", style.text)}>{value}</p>
      {subtitle && (
        <p className={cn("text-[10px] font-bold opacity-50 truncate w-full", style.text)}>{subtitle}</p>
      )}
    </div>
  )
}

function cn(...inputs: (string | boolean | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ")
}