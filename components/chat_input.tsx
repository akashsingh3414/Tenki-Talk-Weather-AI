"use client"

import * as React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Square, Loader2, AlertTriangle, MapPin, Keyboard, Sparkles, Clock, Plus, Minus } from "lucide-react"
import { i18n, type Language } from "@/lib/i18n"
import { Transcriber } from "@/lib/types"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSendMessage: () => void
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

function Tooltip({
  children,
  content,
  visible,
  onMouseEnter,
  onMouseLeave,
  variant = "warning"
}: {
  children: React.ReactNode,
  content: string,
  visible: boolean,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
  variant?: "warning" | "info"
}) {
  return (
    <div
      className="relative flex flex-col items-center group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full mb-3 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none z-50">
          <div className="bg-slate-900/95 dark:bg-slate-800/98 backdrop-blur-xl text-white text-[13px] py-1.5 px-3 rounded-xl whitespace-nowrap shadow-2xl border border-white/20 font-medium flex items-center gap-2 ring-1 ring-black/5">
            {variant === "warning" && <AlertTriangle size={14} className="text-amber-400" />}
            {variant === "info" && <Sparkles size={14} className="text-blue-400" />}
            {content}
          </div>
          <div className="w-3 h-3 bg-slate-900/95 dark:bg-slate-800/98 rotate-45 -mt-1.5 border-r border-b border-white/20" />
        </div>
      )}
    </div>
  )
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [showMicTooltip, setShowMicTooltip] = React.useState(false)
  const [showSendTooltip, setShowSendTooltip] = React.useState(false)
  const [showFamousTooltip, setShowFamousTooltip] = React.useState(false)
  const [showLocationsTooltip, setShowLocationsTooltip] = React.useState(false)
  const [showMinDurationTooltip, setShowMinDurationTooltip] = React.useState(false)
  const [showMaxDurationTooltip, setShowMaxDurationTooltip] = React.useState(false)
  const [showDurationLabelTooltip, setShowDurationLabelTooltip] = React.useState(false)
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

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
    isRecording ? stopRecording() : startRecording()
  }

  const handleSubmit = () => {
    if (value.trim()) {
      onSendMessage()
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const label = i18n[language].chatInput
  const placeholder = currentCity
    ? label.placeholderWithCity
    : label.placeholderNoCity

  return (
    <div className="flex flex-col-reverse lg:flex-row w-full gap-2">
      <div className={`flex-1 min-w-0 relative w-full ${showLocations ? "hidden lg:block" : "block"}`}>
        <Input
          ref={inputRef}
          value={isRecording ? transcriber.interimTranscript : value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          title={!currentCity ? i18n[language].citySelector.selectCityTooltip : ""}
          placeholder={isRecording ? label.listening : placeholder}
          disabled={isLoading || isRecording}
          className={`w-full h-11 text-sm px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none transition-all focus-visible:ring-0 ${isRecording ? "text-blue-500 font-medium" : ""
            }`}
        />

        {isRecording && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 justify-end lg:justify-start">
        {onToggleLocations && (
          <Tooltip
            content={showLocations ? label.showKeyboard : label.showLocations}
            visible={showLocationsTooltip}
            onMouseEnter={() => setShowLocationsTooltip(true)}
            onMouseLeave={() => setShowLocationsTooltip(false)}
            variant="info"
          >
            <button
              onClick={onToggleLocations}
              title=""
              className={`lg:hidden rounded-full h-10 w-10 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center ${showLocations
                ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-110"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
            >
              {showLocations ? <Keyboard size={18} /> : <MapPin size={18} />}
            </button>
          </Tooltip>
        )}

        <div className={`flex items-center gap-1.5 ${showLocations ? "hidden lg:flex" : "flex"}`}>
          {!isRecording && (
            <Tooltip
              content={i18n[language].citySelector.selectCityFirst}
              visible={showSendTooltip && !currentCity}
              onMouseEnter={() => setShowSendTooltip(true)}
              onMouseLeave={() => setShowSendTooltip(false)}
            >
              <button
                onClick={handleSubmit}
                disabled={isLoading || !value.trim()}
                className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full h-11 px-4 flex items-center justify-center transition-all ${isLoading || !value.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </Tooltip>
          )}

          <Tooltip
            content={i18n[language].citySelector.selectCityFirst}
            visible={showMicTooltip && !currentCity}
            onMouseEnter={() => setShowMicTooltip(true)}
            onMouseLeave={() => setShowMicTooltip(false)}
          >
            <button
              onClick={toggleRecording}
              disabled={(isLoading && !isRecording)}
              className={`rounded-full h-11 px-4 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 ${isRecording
                ? "animate-pulse shadow-lg scale-110 bg-red-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                } ${isLoading && !isRecording ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {isRecording ? (
                <>
                  <Square size={16} />
                </>
              ) : (
                <Mic
                  size={18}
                  className={isLoading ? "animate-pulse text-slate-400" : ""}
                />
              )}
            </button>
          </Tooltip>

          <Tooltip
            content="Trip Duration"
            visible={showDurationLabelTooltip && !showMinDurationTooltip && !showMaxDurationTooltip}
            onMouseEnter={() => setShowDurationLabelTooltip(true)}
            onMouseLeave={() => setShowDurationLabelTooltip(false)}
            variant="info"
          >
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full h-11 px-1.5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-full p-1.5 mr-1 ml-1 shadow-sm">
                <Clock size={16} className="text-slate-600 dark:text-slate-400" />
              </div>

              <Tooltip
                content="Min 1 day"
                visible={showMinDurationTooltip}
                variant="warning"
              >
                <button
                  onMouseEnter={() => duration <= 1 && setShowMinDurationTooltip(true)}
                  onMouseLeave={() => setShowMinDurationTooltip(false)}
                  onClick={() => onDurationChange(Math.max(1, duration - 1))}
                  className={`w-9 h-9 flex items-center justify-center rounded-full font-semibold text-lg transition-all ${duration <= 1
                    ? "opacity-30 cursor-not-allowed text-slate-400"
                    : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95"
                    }`}
                  disabled={duration <= 1}
                >
                  <Minus size={16} />
                </button>
              </Tooltip>

              <span className="min-w-[2rem] text-center text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                {duration}
              </span>

              <Tooltip
                content="Max 5 days"
                visible={showMaxDurationTooltip}
                variant="warning"
              >
                <button
                  onMouseEnter={() => duration >= 5 && setShowMaxDurationTooltip(true)}
                  onMouseLeave={() => setShowMaxDurationTooltip(false)}
                  onClick={() => onDurationChange(Math.min(5, duration + 1))}
                  className={`w-9 h-9 flex items-center justify-center rounded-full font-semibold text-lg transition-all ${duration >= 5
                    ? "opacity-30 cursor-not-allowed text-slate-400"
                    : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95"
                    }`}
                  disabled={duration >= 5}
                >
                  <Plus size={16} />
                </button>
              </Tooltip>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1.5 ml-0.5">
                day{duration !== 1 ? 's' : ''}
              </span>
            </div>
          </Tooltip>

          {onToggleFamous && (
            <Tooltip
              content={showFamous ? i18n[language].famousPlaces.hide : i18n[language].famousPlaces.show}
              visible={showFamousTooltip}
              onMouseEnter={() => setShowFamousTooltip(true)}
              onMouseLeave={() => setShowFamousTooltip(false)}
              variant="info"
            >
              <button
                onClick={onToggleFamous}
                title=""
                className={`rounded-full h-11 px-4 border transition-all flex items-center justify-center gap-2 ${showFamous
                  ? "bg-blue-800 text-white border-blue-800 shadow-lg scale-110"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
              >
                <Sparkles size={18} className={showFamous ? "animate-pulse" : ""} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
