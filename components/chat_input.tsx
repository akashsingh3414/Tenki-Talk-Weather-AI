"use client"

import * as React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, Square, Loader2, AlertTriangle, MapPin, Keyboard } from "lucide-react"
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
      className="relative flex flex-col items-center group"
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
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [showMicTooltip, setShowMicTooltip] = React.useState(false)
  const [showSendTooltip, setShowSendTooltip] = React.useState(false)
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
    <div className="flex flex-col-reverse lg:flex-row w-full gap-3">
      <div className={`flex-1 min-w-0 relative w-full ${showLocations ? "hidden lg:block" : "block"}`}>
        <Input
          ref={inputRef}
          value={isRecording ? transcriber.interimTranscript : value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          title={!currentCity ? i18n[language].citySelector.selectCityTooltip : ""}
          placeholder={isRecording ? "Listening..." : placeholder}
          disabled={isLoading || isRecording}
          className={`w-full h-12 text-lg px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-none transition-all focus-visible:ring-0 ${isRecording ? "text-blue-500 font-medium" : ""
            }`}
        />

        {isRecording && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 justify-end lg:justify-start">
        {onToggleLocations && (
          <button
            onClick={onToggleLocations}
            title={showLocations ? "Show Keyboard" : "Show Locations"}
            className={`lg:hidden rounded-full h-12 w-12 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center ${showLocations
              ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-110"
              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
          >
            {showLocations ? <Keyboard size={22} /> : <MapPin size={22} />}
          </button>
        )}

        <div className={`flex items-center gap-2 ${showLocations ? "hidden lg:flex" : "flex"}`}>
          <Tooltip
            content={i18n[language].citySelector.selectCityFirst}
            visible={showMicTooltip && !currentCity}
            onMouseEnter={() => setShowMicTooltip(true)}
            onMouseLeave={() => setShowMicTooltip(false)}
          >
            <button
              onClick={toggleRecording}
              disabled={(isLoading && !isRecording)}
              className={`rounded-full h-12 w-12 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center ${isRecording
                ? "animate-pulse shadow-lg scale-110 bg-red-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                } ${isLoading && !isRecording ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {isRecording ? (
                <Square size={20} />
              ) : (
                <Mic
                  size={22}
                  className={isLoading ? "animate-pulse text-slate-400" : ""}
                />
              )}
            </button>
          </Tooltip>

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
                className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center transition-all ${isLoading || !value.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
