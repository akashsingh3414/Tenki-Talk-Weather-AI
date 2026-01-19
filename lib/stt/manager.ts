import { BrowserSTTProvider } from "./providers/browser.provider";
import { WhisperSTTProvider } from "./providers/whisper.provider";
import { STTOptions, STTResult } from "./types";

export class STTManager {
    private browserProvider: BrowserSTTProvider;
    private whisperProvider: WhisperSTTProvider;

    constructor() {
        this.browserProvider = new BrowserSTTProvider();
        this.whisperProvider = new WhisperSTTProvider();
    }

    private getLanguageProvider(language: string) {
        return this.whisperProvider;
    }

    async startHybrid(options: STTOptions) {
        if (this.browserProvider.isSupported()) {
            try {
                await this.browserProvider.start(options);
            } catch (e) {
                console.warn("Browser STT failed to start:", e);
                if (options.onProgress) {
                    options.onProgress({ status: 'processing', message: 'Browser STT failed, using Cloud...' });
                }
            }
        } else {
            console.log("Browser STT not supported, will use cloud fallback on stop.");
            if (options.onProgress) {
                options.onProgress({ status: 'processing', message: 'Browser STT not supported, using Cloud...' });
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

        const provider = this.getLanguageProvider(options.language);
        try {
            return await provider.transcribe(audio, options);
        } catch (e) {
            console.error("Cloud STT Fallback failed:", e);
            return null;
        }
    }

    stopAll() {
        this.browserProvider.stop();
    }
}

export const sttManager = new STTManager();
