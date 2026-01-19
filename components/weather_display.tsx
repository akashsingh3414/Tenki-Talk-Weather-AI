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

interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    description: string
    details: string
    wind_speed: number
    clouds: number
    visibility: number
    city: string
    country: string
    sunrise?: number
    sunset?: number
    sea_level?: number
    grnd_level?: number
    wind_deg?: number
    dt?: number
  }
  forecast: Array<{
    time: string
    temp: number
    description: string
    humidity: number
    wind_speed: number
    rain: number
  }>
}

interface WeatherDisplayProps {
  weatherData: WeatherData
  language: Language
  isVertical?: boolean
}

export function WeatherDisplay({ weatherData, language, isVertical = false }: WeatherDisplayProps) {
  const labels = i18n[language].weatherDisplay
  const { current, forecast } = weatherData
  const currentStyle = getTempColor(current?.temp)

  if (!current) return null

  // Format sunrise and sunset times
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp * 1000).toLocaleTimeString(
      language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
  }

  const sunriseTime = formatTime(current.sunrise)
  const sunsetTime = formatTime(current.sunset)

  // Format visibility
  const visibilityKm = current.visibility ? (current.visibility / 1000).toFixed(1) : null
  const visibilityLevel = current.visibility
    ? (current.visibility >= 10000 ? labels.visibilityExcellent
      : current.visibility >= 5000 ? labels.visibilityGood
        : current.visibility >= 2000 ? labels.visibilityModerate
          : labels.visibilityPoor)
    : null

  return (
    <div className={`w-full gap-1 space-y-2 ${!isVertical ? "lg:h-full lg:flex lg:flex-col" : ""}`}>
      <div
        className={`${currentStyle.bg} border ${currentStyle.border} rounded-xl p-3 sm:p-4 shadow-lg transition-colors duration-500 ${!isVertical ? "lg:flex-none" : ""}`}
      >
        <div className={`flex items-start justify-between mb-2 ${currentStyle.text}`}>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-xl font-bold">
              {current.city}
            </h2>
            <p className="text-sm sm:text-base lg:text-sm opacity-80">
              {current.country}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl sm:text-3xl lg:text-3xl font-black">
              {Math.round(current.temp)}°C
            </p>
            <p className="text-xs sm:text-sm lg:text-xs opacity-70 font-semibold flex items-center justify-end gap-1 text-right">
              <Thermometer size={14} className="opacity-80" />
              {Math.round(current.feels_like)}°
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <WeatherConditionIcon
            condition={current.description}
            size={30}
            className={currentStyle.text}
          />
          <p
            className={`text-sm sm:text-base lg:text-sm font-bold capitalize px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 w-fit ${currentStyle.text}`}
          >
            {current.details}
          </p>
        </div>

        {(sunriseTime || sunsetTime) && (
          <div className={`flex gap-3 mb-2 text-xs lg:text-sm ${currentStyle.text}`}>
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
          {(current.sea_level || current.grnd_level) && (
            <Stat
              icon={<ArrowDownToLine size={14} />}
              label={current.sea_level ? labels.seaLevel : labels.groundLevel}
              value={`${current.sea_level || current.grnd_level} hPa`}
              style={currentStyle}
            />
          )}
        </div>
      </div>

      {forecast && forecast.length > 0 && (
        <div className={`bg-card border border-border rounded-xl p-2 sm:p-4 lg:p-2 lg:mt-1 ${!isVertical ? "lg:flex-1 lg:flex lg:flex-col lg:min-h-0" : ""}`}>
          <h3 className="text-sm lg:text-[12px] font-semibold uppercase text-muted-foreground mb-2 lg:mb-1">
            {labels.forecast}{" "}
            <span className="text-xs lg:text-[10px] lowercase opacity-70">
              {labels.forecastHint}
            </span>
          </h3>

          <div
            className={`flex ${isVertical
              ? "flex-row overflow-x-auto no-scrollbar"
              : "flex-row overflow-x-auto snap-x snap-mandatory no-scrollbar lg:overflow-y-auto lg:flex-1"
              } gap-2 pb-0.5`}
          >
            {!isVertical ? (
              // 2x2 Grid Layout for Desktop Sidebar (Scroll 4 at a time)
              Array.from({ length: Math.ceil(forecast.slice(0, 12).length / 4) }).map((_, groupIdx) => (
                <div
                  key={groupIdx}
                  className="grid grid-cols-2 grid-rows-2 gap-1.5 flex-none w-full snap-start"
                >
                  {forecast.slice(groupIdx * 4, groupIdx * 4 + 4).map((item, idx) => (
                    <ForecastCard key={idx} item={item} language={language} labels={labels} isCompact={true} />
                  ))}
                </div>
              ))
            ) : (
              // Single Row Horizontal Scroll for Mobile Dropdown
              forecast.map((item, idx) => (
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

  return <Sun size={size} className={className} /> // Default
}

function ForecastCard({ item, language, labels, isCompact = false }: { item: any, language: Language, labels: any, isCompact?: boolean }) {
  const itemStyle = getTempColor(item.temp)
  const time = item.time
    ? new Date(item.time).toLocaleTimeString(
      language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
    : "--:--"

  return (
    <div className={`${itemStyle.bg} border ${itemStyle.border} rounded-lg ${isCompact ? "p-2 lg:p-3" : "p-3"} w-full h-full flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98]`}>
      <div className={itemStyle.text}>
        <p className={`${isCompact ? "text-[11px] lg:text-sm" : "text-[10px]"} font-bold opacity-80 ${isCompact ? "mb-0 lg:mb-1" : "mb-1"}`}>{time}</p>
        <div className="flex items-center gap-2 mb-1">
          <WeatherConditionIcon condition={item.description} size={isCompact ? 20 : 24} />
          <p className={`${isCompact ? "text-lg lg:text-2xl" : "text-xl sm:text-2xl"} font-black`}>{Math.round(item.temp)}°</p>
        </div>
        <p className={`${isCompact ? "text-xs lg:text-sm" : "text-[10px] sm:text-xs"} font-bold capitalize opacity-90 leading-tight ${isCompact ? "line-clamp-1 lg:line-clamp-2" : "line-clamp-2"}`}>{item.description}</p>
      </div>

      <div className={`${isCompact ? "text-[10px] lg:text-xs" : "text-[10px] sm:text-xs"} ${isCompact ? "pt-1" : "pt-2"} border-t border-white/20 ${itemStyle.text} min-w-0`}>
        <div className="flex justify-between items-center gap-1">
          <div className="flex items-center gap-1 opacity-80 min-w-0">
            <Droplets size={12} className="flex-none" />
          </div>
          <span className="font-bold truncate">{item.humidity}%</span>
        </div>
        {!isCompact && (
          <div className="flex justify-between items-center gap-1">
            <div className="flex items-center gap-1 opacity-80 min-w-0">
              <Wind size={12} className="flex-none" />
            </div>
            <span className="font-bold truncate">{item.wind_speed}m/s</span>
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