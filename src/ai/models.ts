import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"

const geminiModelId = process.env.GEMINI_MODEL_ID || "gemini-3.6-flash"
const groqModelId = process.env.GROQ_MODEL_ID || "openai/gpt-oss-120b"
export const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const AI_MODELS = {
    PRIMARY: {
        name: `Gemini (${geminiModelId})`,
        model: googleProvider(geminiModelId),
    },
    FALLBACK: {
        name: `Groq (${groqModelId})`,
        model: groq(groqModelId),
    },
}
