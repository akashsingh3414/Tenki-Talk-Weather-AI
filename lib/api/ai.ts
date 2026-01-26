import { AIProvider } from "@/lib/ai/provider.interface"
import { HuggingFaceProvider } from "@/lib/ai/providers/huggingface.provider"
import { GeminiProvider } from "@/lib/ai/providers/gemini.provider"

function getAvailableProviders(): AIProvider[] {
  const available: AIProvider[] = []
  try {
    available.push(new HuggingFaceProvider())
  } catch (_e) { }
  try {
    available.push(new GeminiProvider())
  } catch (_e) { }
  return available
}

const providers = getAvailableProviders()

export async function executeWithFallback<T>(
  operation: (provider: AIProvider) => Promise<T>
): Promise<{ result: T; provider: string }> {
  const errors: Error[] = []

  for (const provider of providers) {
    try {
      const result = await operation(provider)
      return { result, provider: provider.getName() }
    } catch (error: unknown) {
      errors.push(error instanceof Error ? error : new Error(String(error)))
      continue
    }
  }

  throw new Error(
    `All AI providers failed. Errors: ${errors.map(e => e.message).join(", ")}`
  )
}

export function parseAIResponse(aiResponse: string): string | object {
  let finalSuggestions: string | object = aiResponse
  try {
    let cleanResponse = aiResponse.trim()

    if (cleanResponse.includes("```")) {
      const match = cleanResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (match && match[1]) {
        cleanResponse = match[1].trim()
      }
    }

    if (cleanResponse.startsWith("{") || cleanResponse.startsWith("[")) {
      finalSuggestions = JSON.parse(cleanResponse)
    }
  } catch (_e) {
    const jsonMatch = aiResponse.match(/\{[\s\S]*$/)
    if (jsonMatch) {
      try {
        let partialJson = jsonMatch[0]
        const openBraces = (partialJson.match(/\{/g) || []).length
        const closeBraces = (partialJson.match(/\}/g) || []).length
        const openBrackets = (partialJson.match(/\[/g) || []).length
        const closeBrackets = (partialJson.match(/\]/g) || []).length

        for (let i = 0; i < openBrackets - closeBrackets; i++) partialJson += "]"
        for (let i = 0; i < openBraces - closeBraces; i++) partialJson += "}"

        finalSuggestions = JSON.parse(partialJson)
      } catch (_fixError) {
        finalSuggestions = aiResponse
      }
    } else {
      finalSuggestions = aiResponse
    }
  }
  return finalSuggestions
}
