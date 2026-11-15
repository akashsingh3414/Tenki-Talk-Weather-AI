import { STTProvider } from "../provider.interface";
import { STTOptions, STTResult } from "../types";

export class GoogleSTTProvider implements STTProvider {
    private readonly baseUrl = "/api/stt";

    getName(): string {
        return "Gemini Speech-to-Text";
    }

    isSupported(): boolean {
        return true;
    }

    async start(options: STTOptions): Promise<void> {
        options.onProgress?.({ status: "started" });
    }

    stop(): void {}

    async transcribe(audio: Blob, options: STTOptions): Promise<STTResult> {
        options.onProgress?.({ status: "processing", message: "Transcribing voice..." });

        const formData = new FormData();
        formData.append("audio", audio, "recording.webm");
        formData.append("language", options.language);

        const response = await fetch(this.baseUrl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `Gemini transcription failed: ${response.statusText}`);
        }

        const data = await response.json();
        const result = { text: data.text || "", isFinal: true };
        options.onResult(result);
        return result;
    }
}
