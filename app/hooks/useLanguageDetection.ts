"use client"

import { useCallback, useRef } from "react"
import { BrowserAI } from "@/lib/translation_utils"
import { type Language } from "@/lib/i18n"

export function useLanguageDetection() {
    const isDetecting = useRef(false)

    const detectLanguage = useCallback(async (text: string): Promise<Language | null> => {
        if (!text || text.trim().length < 15 || isDetecting.current) return null

        isDetecting.current = true
        try {
            const availability = await BrowserAI.getDetectorAvailability();
            if (availability !== "available") {
                isDetecting.current = false;
                return null;
            }

            const detected = await BrowserAI.detectLanguage(text)
            if (detected) {
                const map: { [key: string]: Language } = {
                    "en": "en-US",
                    "ja": "ja-JP",
                    "hi": "hi-IN"
                }

                const targetLang = map[detected]
                if (targetLang) {
                    return targetLang
                }
            }
        } catch (e) {
            console.error("Language detection hook failed", e)
        } finally {
            isDetecting.current = false
        }
        return null
    }, [])

    return { detectLanguage }
}
