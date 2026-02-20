"use client"

import * as React from "react"
import { useRef, useEffect, useContext } from "react"
import { LanguageContext } from "@/lib/language_context"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send, Keyboard, MapPin, Mic, Loader2, Square, Clock, Plus, Minus, Sparkles, AlertTriangle } from "lucide-react"
import { type Language } from "@/lib/i18n"
import { Transcriber } from "@/lib/types"
import { useLanguageDetection } from "@/app/hooks/useLanguageDetection"
import { Tooltip } from "@/components/ui/tooltip"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSendMessage: (value: string, detectedLang?: string | null) => void
  isLoading: boolean
  onAudioRecorded: (blob: Blob) => void
  language: Language
  transcriber: Transcriber
  currentCity?: string
  showLocations?: boolean
  onToggleLocations?: () => void
  showFamous?: boolean
  onToggleFamous?: () => void
  duration: number
  onDurationChange: (duration: number) => void
}

export function ChatInput({
  value,
  onChange,
  onSendMessage,
  isLoading,
  onAudioRecorded,
  language,
  transcriber,
  currentCity,
  showLocations,
  onToggleLocations,
  showFamous,
  onToggleFamous,
  duration,
  onDurationChange
}: ChatInputProps) {
  const { dictionary } = useContext(LanguageContext);
  const t = dictionary.chatInput;
  const inputRef = useRef<HTMLInputElement>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null)
  const { detectLanguage } = useLanguageDetection()
  const [inputLanguage, setInputLanguage] = React.useState<Language>(language)
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  React.useEffect(() => {
    if (activeTooltip) {
      const timer = setTimeout(() => {
        setActiveTooltip(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [activeTooltip])

  const startRecording = async () => {
    try {
      chunksRef.current = []
      transcriber.startLive(language)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        onAudioRecorded(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch {
      transcriber.onInputChange()
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const sanitizeQuery = (text: string) => {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B06}\u{2194}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{231A}-\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}-\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{262E}-\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26C8}\u{26CE}-\u{26CF}\u{26D1}\u{26D3}-\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, '').trim();
  }

  const handleSubmit = () => {
    const sanitizedValue = sanitizeQuery(value);
    if (sanitizedValue) {
      onSendMessage(sanitizedValue, inputLanguage)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    const textToDetect = isRecording ? transcriber.interimTranscript : value;
    if (textToDetect) {
      const timer = setTimeout(async () => {
        const detected = await detectLanguage(textToDetect)
        if (detected) setInputLanguage(detected)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [value, transcriber.interimTranscript, isRecording, detectLanguage])

  const placeholder = currentCity
    ? t.placeholderWithCity
    : t.placeholderNoCity

  return (
    <div className="flex flex-col-reverse lg:flex-row w-full gap-3 lg:gap-2 items-center">
      <div className="w-full lg:flex-1 min-w-0 relative">
        <Input
          ref={inputRef}
          value={isRecording ? (transcriber.interimTranscript || "") : value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? t.listening : placeholder}
          disabled={isLoading || isRecording}
          className={cn(
            "w-full h-11 text-sm px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-none transition-all focus-visible:ring-0",
            isRecording && "text-blue-500 font-medium"
          )}
        />

        {isRecording && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 justify-center lg:justify-start w-full lg:w-auto">
        {onToggleLocations && (
          <Tooltip
            content={showLocations ? t.showKeyboard : t.showLocations}
            visible={activeTooltip === "locations"}
            variant="info"
          >
            <button
              onClick={onToggleLocations}
              onMouseEnter={() => setActiveTooltip("locations")}
              onMouseLeave={() => setActiveTooltip(null)}
              className={cn(
                "flex-shrink-0 lg:hidden rounded-full h-10 w-10 border border-slate-300 dark:border-slate-800 transition-all flex items-center justify-center",
                showLocations
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-110"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              )}
            >
              {showLocations ? <Keyboard size={18} /> : <MapPin size={18} />}
            </button>
          </Tooltip>
        )}

        {!isRecording && (
          <Tooltip
            content={currentCity ? t.send : dictionary.citySelector.selectCityFirst}
            visible={activeTooltip === "send"}
          >
            <div
              className="flex items-center justify-center h-11"
              onMouseEnter={() => setActiveTooltip("send")}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <button
                onClick={handleSubmit}
                disabled={isLoading || !value.trim()}
                className={cn(
                  "flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full h-full px-4 flex items-center justify-center transition-all",
                  (isLoading || !value.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </Tooltip>
        )}

        <Tooltip
          content={!currentCity ? dictionary.citySelector.selectCityFirst : (isRecording ? t.stop : t.voiceInput)}
          visible={activeTooltip === "mic"}
        >
          <div
            className="flex items-center justify-center h-11"
            onMouseEnter={() => setActiveTooltip("mic")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <button
              onClick={toggleRecording}
              disabled={!currentCity || (isLoading && !isRecording)}
              className={cn(
                "flex-shrink-0 rounded-full h-full px-4 border border-slate-300 dark:border-slate-800 transition-all flex items-center justify-center gap-2",
                isRecording
                  ? "animate-pulse shadow-lg scale-110 bg-red-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400",
                (!currentCity || (isLoading && !isRecording)) && "cursor-not-allowed opacity-50"
              )}
            >
              {isRecording ? <Square size={16} /> : <Mic size={18} className={isLoading ? "animate-pulse text-slate-400" : ""} />}
            </button>
          </div>
        </Tooltip>

        <Tooltip
          content={t.tripDuration}
          visible={activeTooltip === "duration-label"}
          variant="info"
        >
          <div
            onMouseEnter={() => setActiveTooltip("duration-label")}
            onMouseLeave={() => setActiveTooltip(null)}
            className="flex-shrink-0 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full h-11 px-1.5 border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow transition-all duration-200"
          >
            <div className="bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm">
              <Clock size={16} className="text-slate-600 dark:text-slate-400" />
            </div>

            <Tooltip
              content={t.minDuration}
              visible={activeTooltip === "min-duration"}
              variant="warning"
            >
              <div
                onMouseEnter={() => duration <= 1 && setActiveTooltip("min-duration")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="flex items-center justify-center pointer-events-auto"
              >
                <button
                  onClick={() => onDurationChange(Math.max(1, duration - 1))}
                  className={cn(
                    "flex items-center justify-center rounded-full font-semibold text-lg transition-all p-1.5",
                    duration <= 1
                      ? "opacity-30 cursor-not-allowed text-slate-400"
                      : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95"
                  )}
                  disabled={duration <= 1}
                >
                  <Minus size={16} />
                </button>
              </div>
            </Tooltip>

            <span className="min-w-[2rem] text-center text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {duration}
            </span>

            <Tooltip
              content={t.maxDuration}
              visible={activeTooltip === "max-duration"}
              variant="warning"
            >
              <div
                onMouseEnter={() => duration >= 5 && setActiveTooltip("max-duration")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="flex items-center justify-center pointer-events-auto"
              >
                <button
                  onClick={() => onDurationChange(Math.min(5, duration + 1))}
                  className={cn(
                    "flex items-center justify-center rounded-full font-semibold text-lg transition-all p-1.5",
                    duration >= 5
                      ? "opacity-30 cursor-not-allowed text-slate-400"
                      : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95"
                  )}
                  disabled={duration >= 5}
                >
                  <Plus size={16} />
                </button>
              </div>
            </Tooltip>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
              {duration === 1 ? t.day : t.days}
            </span>
          </div>
        </Tooltip>

        {onToggleFamous && (
          <Tooltip
            content={dictionary.famousPlaces.tooltip}
            visible={activeTooltip === "famous"}
            variant="info"
          >
            <button
              onClick={onToggleFamous}
              onMouseEnter={() => setActiveTooltip("famous")}
              onMouseLeave={() => setActiveTooltip(null)}
              className={cn(
                "flex-shrink-0 rounded-full h-11 px-4 border transition-all flex items-center justify-center gap-2",
                showFamous
                  ? "bg-blue-800 text-white border-blue-800 shadow-lg scale-110"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              )}
            >
              <Sparkles size={18} className={cn(showFamous && "animate-pulse")} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
