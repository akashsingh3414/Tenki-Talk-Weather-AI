import { BrowserSTTProvider } from "./providers/browser.provider";
import { GoogleSTTProvider } from "./providers/google.provider";
import { STTOptions, STTResult } from "./types";

export class STTManager {
    private browserProvider: BrowserSTTProvider;
    private cloudProvider: GoogleSTTProvider;

    constructor() {
        this.browserProvider = new BrowserSTTProvider();
        this.cloudProvider = new GoogleSTTProvider();
    }

    private getLanguageProvider() {
        return this.cloudProvider;
    }

    async startHybrid(options: STTOptions) {
        if (this.browserProvider.isSupported()) {
            try {
                await this.browserProvider.start(options);
            } catch (e) {
                console.warn("Browser STT failed to start:", e);
                if (options.onProgress) {
                    options.onProgress({ status: 'processing', message: 'Browser STT failed, using Gemini...' });
                }
            }
        } else {
            console.log("Browser STT not supported, will use Gemini on stop.");
            if (options.onProgress) {
                options.onProgress({ status: 'processing', message: 'Browser STT not supported, using Gemini...' });
            }
        }
    }

    async finalizeWithFallback(audio: Blob, options: STTOptions, currentTranscript?: string): Promise<STTResult | null> {
        this.browserProvider.stop();

        if (currentTranscript && currentTranscript.trim().length >= 2) {
            console.log("Using Browser STT result directly:", currentTranscript);
            const result = { text: currentTranscript, isFinal: true };
            options.onResult(result);
            return result;
        }

        const provider = this.getLanguageProvider();
        try {
            return await provider.transcribe(audio, options);
        } catch (e) {
            console.error("Gemini STT fallback failed:", e);
            return null;
        }
    }

    stopAll() {
        this.browserProvider.stop();
    }
}

export const sttManager = new STTManager();
