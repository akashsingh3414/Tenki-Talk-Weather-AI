import { type NextRequest, NextResponse } from "next/server"
import { experimental_transcribe as transcribe } from "ai"
import { googleProvider } from "@/src/ai/models"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const audio = formData.get("audio")
        const language = formData.get("language")

        if (!(audio instanceof Blob) || (typeof language !== "string" && language !== null)) {
            return NextResponse.json({ error: "A valid audio file is required" }, { status: 400 })
        }

        const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "Google AI API key is not configured" }, { status: 500 })
        }

        const languageCode = typeof language === "string"
            ? language.split("-")[0].toLowerCase()
            : undefined
        const providerOptions = languageCode && /^[a-z]{2}$/.test(languageCode)
            ? { google: { languageCodes: [languageCode] } }
            : undefined

        const result = await transcribe({
            model: googleProvider.transcription(process.env.GOOGLE_STT_MODEL_ID || "gemini-3.5-transcribe"),
            audio: new Uint8Array(await audio.arrayBuffer()),
            providerOptions,
        })

        return NextResponse.json({ text: result.text, isFinal: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to transcribe audio via Gemini."
        console.error("[STT Proxy] Gemini error:", message)
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
