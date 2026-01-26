"use client"

import * as React from "react"
import { i18n, type Language } from "@/lib/i18n"
import { getTempColor } from "@/lib/weather_colors"
import {
  Droplets,
  Wind,
  Gauge,
  Cloud,
  Eye,
  Sunrise,
  Sunset,
  ArrowDownToLine,
  Thermometer,
  Sun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  CloudDrizzle
} from "lucide-react"

import { WeatherData, Forecast } from "@/lib/ai/types"

type WeatherDisplayLabels = typeof i18n["en-US"]["weatherDisplay"]

interface WeatherDisplayProps {
  weatherData: WeatherData
  language: Language
  isVertical?: boolean
}

export function WeatherDisplay({ weatherData, language, isVertical = false }: WeatherDisplayProps) {
  const labels = i18n[language]?.weatherDisplay || i18n["en-US"].weatherDisplay
  const { current, forecast } = weatherData || {}
  const currentStyle = getTempColor(current?.temp)

  // Group forecast by date
  /* eslint-disable react-hooks/exhaustive-deps */
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

  if (!weatherData || !weatherData.current || !current) return null

  const displayedForecast = groupedForecast[selectedDate] || []

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const common = i18n[language]?.common || i18n["en-US"].common

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

  if (!current) return null

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
  const visibilityLevel = current.visibility
    ? (current.visibility >= 10000 ? labels.visibilityExcellent
      : current.visibility >= 5000 ? labels.visibilityGood
        : current.visibility >= 2000 ? labels.visibilityModerate
          : labels.visibilityPoor)
    : null

  return (
    <div className={`w-full gap-1 space-y-1.5 ${!isVertical ? "lg:h-full lg:flex lg:flex-col lg:gap-1.5 lg:space-y-0" : ""}`}>
      <div
        className={`${currentStyle.bg} border ${currentStyle.border} rounded-xl p-2 sm:p-2.5 shadow-lg transition-colors duration-500 h-full
          }`}
      >
        <div className={`flex items-start justify-between mb-1.5 ${currentStyle.text}`}>
          <div>
            <h2 className="text-2xl sm:text-2xl lg:text-2xl font-bold">
              {current.city}
            </h2>
            <p className="text-lg sm:text-lg lg:text-lg opacity-80">
              {current.country}
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl sm:text-3xl lg:text-3xl font-black">
              {Math.round(current.temp)}°C
            </p>
            <p className="text-md sm:text-md lg:text-md opacity-70 font-semibold flex items-center justify-end gap-1 text-right">
              {labels.feelsLike}:
              <Thermometer size={14} className="opacity-80" />
              {Math.round(current.feels_like)}°
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <WeatherConditionIcon
              condition={current.description}
              size={30}
              className={currentStyle.text}
            />
            <p
              className={`text-md sm:text-md lg:text-md font-bold capitalize px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 w-fit ${currentStyle.text}`}
            >
              {current.details}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(sunriseTime || sunsetTime) && (
              <div className={`flex gap-3 mb-1.5 text-md lg:text-md ${currentStyle.text}`}>
                {sunriseTime && (
                  <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <Sunrise size={14} className="opacity-80" />
                    <span className="font-black">{sunriseTime}</span>
                  </div>
                )}
                {sunsetTime && (
                  <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <Sunset size={14} className="opacity-80" />
                    <span className="font-black">{sunsetTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          <Stat icon={<Droplets size={14} />} label={labels.humidity} value={`${current.humidity}%`} style={currentStyle} />
          <Stat icon={<Wind size={14} />} label={labels.windSpeed} value={`${current.wind_speed} m/s`} style={currentStyle} />
          <Stat icon={<Gauge size={14} />} label={labels.pressure} value={`${current.pressure} hPa`} style={currentStyle} />
          <Stat icon={<Cloud size={14} />} label={labels.cloudCover} value={`${current.clouds}%`} style={currentStyle} />
          {visibilityKm && (
            <Stat
              icon={<Eye size={14} />}
              label={labels.visibility}
              value={`${visibilityKm}km`}
              subtitle={visibilityLevel || undefined}
              style={currentStyle}
            />
          )}
        </div>
      </div>

      {forecast && forecast.length > 0 && (
        <div className={`bg-card border border-border rounded-xl p-1.5 sm:p-3 lg:p-1.5 flex flex-col h-full`}>
          <div className="flex items-center justify-between gap-1.5 px-2 pb-2">
            <span className="font-bold text-md">{labels.forecast}</span>
            <span className="text-2xs lg:text-xs opacity-70">{labels.forecastHint}</span>
          </div>

          <div className="flex items-center gap-2 mb-1.5 lg:mb-1.5 overflow-x-auto no-scrollbar pb-1">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-none text-[10px] lg:text-[11px] font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${selectedDate === date
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
              >
                {formatDateLabel(date)}
              </button>
            ))}
          </div>

          <div
            className={`flex ${isVertical
              ? "flex-row overflow-x-auto no-scrollbar"
              : "flex-row overflow-x-auto snap-x snap-mandatory no-scrollbar lg:overflow-y-auto lg:flex-1"
              } gap-1.5 pb-0.5 max-h-[80%]`}
          >
            {!isVertical ? (
              Array.from({ length: Math.ceil(displayedForecast.length / 2) }).map((_, groupIdx) => (
                <div
                  key={groupIdx}
                  className="grid grid-cols-2 gap-1.5 flex-none w-full snap-start"
                >
                  {displayedForecast.slice(groupIdx * 2, groupIdx * 2 + 2).map((item, idx) => (
                    <ForecastCard key={idx} item={item} language={language} labels={labels} isCompact={true} />
                  ))}
                </div>
              ))
            ) : (
              displayedForecast.map((item, idx) => (
                <div key={idx} className="flex-none">
                  <ForecastCard item={item} language={language} labels={labels} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
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
  const itemStyle = getTempColor(item.temp)
  const time = item.time
    ? new Date(item.time).toLocaleTimeString(
      language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
    : "--:--"

  return (
    <div className={`max-h-[100%] ${itemStyle.bg} border ${itemStyle.border} rounded-lg ${isCompact ? "pt-1.5 pb-1.5 px-1.5 lg:pt-1.5 lg:pb-1.5 lg:px-1.5" : "p-1.5"} w-full h-full flex flex-col transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden`}>
      <div className={`${itemStyle.text} flex-shrink-0`}>
        <div className="flex justify-between items-start mb-0.5">
          <p className={`${isCompact ? "text-xs sm:text-sm lg:text-sm" : "text-sm"} font-bold opacity-80`}>{time}</p>
          <p className={`${isCompact ? "text-xs sm:text-sm lg:text-sm" : "text-sm"} font-medium opacity-60`}>
            {labels.feelsLike}: {Math.round(item.feels_like)}°
          </p>
        </div>
        <div className="flex items-center justify-between gap-1 mt-1 mb-1 flex-wrap min-h-[32px]">
          <div className="flex items-center gap-1">
            <WeatherConditionIcon condition={item.description} size={isCompact ? 20 : 28} />
            <p className={`${isCompact ? "text-sm sm:text-md lg:text-md" : "text-xl sm:text-xl"} font-black`}>{Math.round(item.temp)}°</p>
          </div>
          <p className={`${isCompact ? "text-[10px] sm:text-xs lg:text-xs" : "text-sm sm:text-md"} font-bold capitalize opacity-90 leading-tight line-clamp-2 max-w-[120px]`}>{item.description}</p>
        </div>
      </div>

      <hr className={`border-t ${itemStyle.text} opacity-20 my-1`} />

      <div className={`${isCompact ? "text-xs sm:text-sm lg:text-sm" : "text-sm sm:text-md"} ${itemStyle.text} min-w-0 flex flex-col gap-0.5 flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 opacity-80 truncate mr-2">
            <Droplets size={12} className="flex-none" />
            <span className="font-medium">{labels.humidity}</span>
          </div>
          <span className="font-bold whitespace-nowrap">{item.humidity}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 opacity-80 truncate mr-2">
            <Wind size={12} className="flex-none" />
            <span className="font-medium">{labels.windSpeed}</span>
          </div>
          <span className="font-bold whitespace-nowrap">{Math.round(item.wind_speed)}m/s</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 opacity-80 truncate mr-2">
            <Gauge size={12} className="flex-none" />
            <span className="font-medium">{labels.pressure}</span>
          </div>
          <span className="font-bold whitespace-nowrap">{item.pressure}hPa</span>
        </div>
        {item.pop > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 opacity-80 truncate mr-2">
              <CloudRain size={12} className="flex-none" />
              <span className="font-medium">{labels.pop}</span>
            </div>
            <span className="font-bold whitespace-nowrap">{Math.round(item.pop * 100)}%</span>
          </div>
        )}
      </div>
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
  style: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-black/10 dark:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-2 flex flex-col items-start min-w-0 transition-all hover:bg-black/20 dark:hover:bg-white/20">
      <div className={`flex items-center gap-1.5 mb-1 ${style.text}`}>
        {icon && <span className="opacity-80">{icon}</span>}
        <p className="text-[9px] uppercase font-bold opacity-70 tracking-wider truncate">
          {label}
        </p>
      </div>
      <p className={`text-[13px] lg:text-sm font-black truncate w-full ${style.text}`}>{value}</p>
      {subtitle && (
        <p className={`text-[10px] font-semibold opacity-60 truncate w-full ${style.text}`}>{subtitle}</p>
      )}
    </div>
  )
}