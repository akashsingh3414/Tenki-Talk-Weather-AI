const STT_MODELS: Record<string, string> = {
    "openai/whisper-large-v3": "Whisper Large V3 (Multilingual)"
}

export async function transcribeAudio(audio: Blob, modelId: string): Promise<string> {
    const modelName = STT_MODELS[modelId] || "Unknown Model"
    console.log(`[STT Client] Transcribing audio using: ${modelId} (${modelName})`)

    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
        throw new Error("HuggingFace API key is not configured")
    }

    const hfUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`

    console.log(`[STT Client] Sending request to: ${hfUrl}`)

    const response = await fetch(hfUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "audio/webm",
        },
        body: audio,
    }).catch(err => {
        console.error(`[STT Client] Network error reaching HF Router:`, err.message)
        throw new Error(`Cloud connection failed: ${err.message}`)
    })

    if (!response.ok) {
        let errorMsg = `Inference Failed (${response.status})`
        try {
            const errorData = await response.json()
            errorMsg = errorData.error?.message || errorData.error || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData))
        } catch (_e) {
            errorMsg = response.statusText
        }
        throw new Error(errorMsg)
    }

    const result = await response.json()
    return result.text || ""
}
