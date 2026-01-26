import { type NextRequest, NextResponse } from "next/server";

const STT_MODELS: Record<string, string> = {
    "openai/whisper-large-v3": "Whisper Large V3 (Multilingual)"
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audio = formData.get("audio") as Blob;
        const modelId = formData.get("modelId") as string;

        if (!audio || !modelId) {
            return NextResponse.json({ error: "Audio and modelId are required" }, { status: 400 });
        }

        const modelName = STT_MODELS[modelId] || "Unknown Model";
        console.log(`[STT Proxy] Transcribing audio using: ${modelId} (${modelName})`);

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "HuggingFace API key is not configured" }, { status: 500 });
        }

        const hfUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;

        console.log(`[STT Proxy] Sending request to: ${hfUrl}`);

        const response = await fetch(hfUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "audio/webm",
            },
            body: audio,
        }).catch(err => {
            console.error(`[STT Proxy] Network error reaching HF Router:`, err.message);
            throw new Error(`Cloud connection failed: ${err.message}`);
        });

        if (!response.ok) {
            let errorMsg = `Inference Failed (${response.status})`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error?.message || errorData.error || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
            } catch (e) {
                errorMsg = response.statusText;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        const resultText = data.text || "";
        console.log(`[STT Proxy] Success: "${resultText.substring(0, 30)}..."`);

        return NextResponse.json({ text: resultText, isFinal: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to transcribe audio via Cloud.";
        console.error("[STT Proxy] Final Error:", message);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
