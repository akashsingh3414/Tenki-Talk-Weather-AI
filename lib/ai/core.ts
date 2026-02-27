import { generateText, type ModelMessage } from "ai"
import { AI_MODELS } from "./models"
import { extractJSON, FALLBACK_PLAN } from "./parser"

export interface AIServiceResponse {
    object: any;
    provider: string;
}

export class AIService {
    static async generateTravelPlan(messages: ModelMessage[]): Promise<AIServiceResponse> {
        try {
            const { text } = await generateText({ model: AI_MODELS.PRIMARY.model, messages, temperature: 0.7 });
            const object = extractJSON(text);
            if (object) {
                console.log(`[AIService] ✓ Groq responded with valid JSON`);
                return { object, provider: AI_MODELS.PRIMARY.name };
            }
            throw new Error("Groq response could not be parsed as JSON");
        } catch (groqError) {
            console.warn("[AIService] Groq failed:", (groqError as Error).message);
        }

        try {
            const { text } = await generateText({
                model: AI_MODELS.FALLBACK.model,
                messages: [
                    { role: "system", content: "Return ONLY a valid JSON object. No conversation filler." },
                    ...messages,
                ],
                temperature: 0.7,
            });
            const object = extractJSON(text);
            if (object) {
                console.log(`[AIService] ✓ Hugging Face responded with valid JSON`);
                return { object, provider: AI_MODELS.FALLBACK.name };
            }
        } catch (hfError) {
            console.error("[AIService] Hugging Face also failed:", (hfError as Error).message);
        }

        console.error("[AIService] All providers failed. Returning fallback.");
        return { object: FALLBACK_PLAN, provider: "None (all failed)" };
    }
}
