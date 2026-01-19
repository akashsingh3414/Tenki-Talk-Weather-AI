import { STTProvider } from "../provider.interface";
import { STTOptions, STTResult } from "../types";

export class HuggingFaceSTTProvider implements STTProvider {
    protected apiKey: string;
    protected modelId: string;
    protected baseUrl: string;

    constructor(modelId: string) {
        this.modelId = modelId;
        this.apiKey = "";
        this.baseUrl = "/api/stt";
    }

    getName(): string {
        return `HuggingFace (${this.modelId})`;
    }

    isSupported(): boolean {
        return true;
    }

    async start(options: STTOptions): Promise<void> {
        if (options.onProgress) {
            options.onProgress({ status: 'started' });
        }
    }

    stop(): void {
    }

    async transcribe(audio: Blob, options: STTOptions): Promise<STTResult> {
        if (options.onProgress) {
            options.onProgress({ status: 'processing', message: `Transcribing voice...` });
        }

        try {
            const formData = new FormData();
            formData.append("audio", audio);
            formData.append("modelId", this.modelId);

            const response = await fetch(this.baseUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Proxy error: ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.text || "";

            const result = {
                text: text,
                isFinal: true
            };

            options.onResult(result);
            return result;
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            if (options.onProgress) {
                options.onProgress({ status: 'error', message: errorMsg });
            }
            throw e;
        }
    }
}
