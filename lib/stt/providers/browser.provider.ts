/* eslint-disable @typescript-eslint/no-explicit-any */
import { STTProvider } from "../provider.interface";
import { STTOptions, STTResult } from "../types";

export class BrowserSTTProvider implements STTProvider {
    private recognition: any | null = null;
    private isRunning: boolean = false;

    getName(): string {
        return "Browser Native STT";
    }

    isSupported(): boolean {
        return typeof window !== "undefined" && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
    }

    async start(options: STTOptions): Promise<void> {
        if (!this.isSupported()) {
            throw new Error("Speech Recognition not supported in this browser");
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.lang = options.language;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event: any) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            options.onResult({
                text: transcript,
                isFinal: event.results[event.results.length - 1].isFinal,
                confidence: event.results[event.results.length - 1][0].confidence
            });
        };

        this.recognition.onerror = (event: any) => {
            if (options.onProgress) {
                options.onProgress({ status: 'error', message: `Browser STT Error: ${event.error}` });
            }
        };

        this.recognition.onstart = () => {
            this.isRunning = true;
            if (options.onProgress) {
                options.onProgress({ status: 'started' });
            }
        };

        this.recognition.onend = () => {
            this.isRunning = false;
        };

        this.recognition.start();
    }

    stop(): void {
        if (this.recognition && this.isRunning) {
            this.recognition.stop();
        }
    }

    async transcribe(audio: Blob, options: STTOptions): Promise<STTResult | null> {
        return null;
    }
}
