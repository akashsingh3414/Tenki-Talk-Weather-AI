import { groq } from "@ai-sdk/groq"
import { huggingface } from "@ai-sdk/huggingface"

export const AI_MODELS = {
    PRIMARY: {
        name: "Groq (llama-3.3-70b-versatile)",
        model: groq("llama-3.3-70b-versatile"),
    },
    FALLBACK: {
        name: "Hugging Face (Llama-3.2-3B-Instruct)",
        model: huggingface("meta-llama/Llama-3.2-3B-Instruct"),
    },
} as const;
