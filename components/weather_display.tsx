"use client"

import { i18n, type Language } from "@/lib/i18n"
import { getTempColor } from "@/lib/weather_colors"

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
    <div className="w-full space-y-4">
      <div className={`${currentStyle.bg} border ${currentStyle.border} rounded-xl p-3 sm:p-4 shadow-lg transition-colors duration-500`}>
        <div className={`flex items-start justify-between mb-3 ${currentStyle.text}`}>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {current.city}
            </h2>
            <p className="text-xs opacity-80">
              {current.country}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xl sm:text-2xl font-black">
              {Math.round(current.temp)}°C
            </p>
            <p className="text-[10px] sm:text-[11px] opacity-70 font-semibold">
              {labels.feelsLike}: {Math.round(current.feels_like)}°
            </p>
          </div>
        </div>

        <p className={`text-xs font-bold capitalize mb-3 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 w-fit ${currentStyle.text}`}>
          {current.details}
        </p>

        {/* Sun Times Section */}
        {(sunriseTime || sunsetTime) && (
          <div className={`flex gap-3 mb-4 text-xs ${currentStyle.text}`}>
            {sunriseTime && (
              <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg">
                <span className="opacity-70 font-semibold">{labels.sunrise}:</span>
                <span className="font-black">{sunriseTime}</span>
              </div>
            )}
            {sunsetTime && (
              <div className="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg">
                <span className="opacity-70 font-semibold">{labels.sunset}:</span>
                <span className="font-black">{sunsetTime}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Stat label={labels.humidity} value={`${current.humidity}%`} style={currentStyle} />
          <Stat label={labels.windSpeed} value={`${current.wind_speed} m/s`} style={currentStyle} />
          <Stat label={labels.pressure} value={`${current.pressure} hPa`} style={currentStyle} />
          <Stat label={labels.cloudCover} value={`${current.clouds}%`} style={currentStyle} />
          {visibilityKm && (
            <Stat
              label={labels.visibility}
              value={`${visibilityKm}km`}
              subtitle={visibilityLevel || undefined}
              style={currentStyle}
            />
          )}
          {(current.sea_level || current.grnd_level) && (
            <Stat
              label={current.sea_level ? labels.seaLevel : labels.groundLevel}
              value={`${current.sea_level || current.grnd_level} hPa`}
              style={currentStyle}
            />
          )}
        </div>
      </div>

      {forecast && forecast.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
            {labels.forecast}{" "}
            <span className="text-3xs lowercase">
              {labels.forecastHint}
            </span>
          </h3>

          <div className={`flex ${isVertical ? "flex-row overflow-x-auto no-scrollbar" : "flex-row overflow-x-auto snap-x snap-mandatory no-scrollbar"} gap-3 pb-1`}>
            {!isVertical ? (
              // 2x2 Grid Layout for Desktop Sidebar (Scroll 4 at a time)
              Array.from({ length: Math.ceil(forecast.slice(0, 24).length / 4) }).map((_, groupIdx) => (
                <div key={groupIdx} className="grid grid-cols-2 grid-rows-2 gap-2 flex-none w-full snap-start">
                  {forecast.slice(groupIdx * 4, groupIdx * 4 + 4).map((item, idx) => (
                    <ForecastCard key={idx} item={item} language={language} labels={labels} />
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

function ForecastCard({ item, language, labels }: { item: any, language: Language, labels: any }) {
  const itemStyle = getTempColor(item.temp)
  const time = item.time
    ? new Date(item.time).toLocaleTimeString(
      language === "ja-JP" ? "ja-JP" : language === "hi-IN" ? "hi-IN" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    )
    : "--:--"

  return (
    <div className={`${itemStyle.bg} border ${itemStyle.border} rounded-lg p-3 w-full h-full flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-[0.98]`}>
      <div className={itemStyle.text}>
        <p className="text-xs font-bold opacity-80 mb-1">{time}</p>
        <p className="text-xl sm:text-2xl font-black mb-1">{Math.round(item.temp)}°</p>
        <p className="text-[10px] sm:text-xs font-bold capitalize opacity-90 leading-tight line-clamp-2">{item.description}</p>
      </div>

      <div className={`space-y-0.5 text-[10px] sm:text-xs mt-3 pt-2 border-t border-white/20 ${itemStyle.text}`}>
        <div className="flex justify-between">
          <span className="opacity-80">{labels.humidity}</span>
          <span className="font-bold">{item.humidity}%</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">{labels.windSpeed}</span>
          <span className="font-bold">{item.wind_speed}m/s</span>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, subtitle, style }: { label: string; value: string; subtitle?: string; style: any }) {
  return (
    <div className="bg-black/10 dark:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-2 flex flex-col items-start">
      <p className={`text-[9px] uppercase font-bold opacity-70 tracking-wider mb-0.5 ${style.text}`}>
        {label}
      </p>
      <p className={`text-sm font-black ${style.text}`}>{value}</p>
      {subtitle && (
        <p className={`text-[9px] font-semibold opacity-60 ${style.text}`}>{subtitle}</p>
      )}
    </div>
  )
}
