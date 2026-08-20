import { groq } from "@ai-sdk/groq"
import { huggingface } from "@ai-sdk/huggingface"

const primaryProvider = process.env.PRIMARY_MODEL_PROVIDER || "groq";
const primaryModelId = process.env.PRIMARY_MODEL_ID || "llama-3.3-70b-versatile";
const primaryModelName = process.env.PRIMARY_MODEL_NAME || `Groq (${primaryModelId})`;

const fallbackProvider = process.env.FALLBACK_MODEL_PROVIDER || "huggingface";
const fallbackModelId = process.env.FALLBACK_MODEL_ID || "meta-llama/Llama-3.2-3B-Instruct";
const fallbackModelName = process.env.FALLBACK_MODEL_NAME || `Hugging Face (${fallbackModelId})`;

function getModel(provider: string, modelId: string) {
    switch (provider.toLowerCase()) {
        case "groq":
            return groq(modelId);
        case "huggingface":
            return huggingface(modelId);
        default:
            console.warn(`[AI Config] Unsupported provider "${provider}", falling back to groq`);
            return groq(modelId);
    }
}

export const AI_MODELS = {
    PRIMARY: {
        name: primaryModelName,
        model: getModel(primaryProvider, primaryModelId),
    },
    FALLBACK: {
        name: fallbackModelName,
        model: getModel(fallbackProvider, fallbackModelId),
    },
};

