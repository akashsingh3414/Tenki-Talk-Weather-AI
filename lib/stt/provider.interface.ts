import { STTOptions, STTResult } from "./types";

export interface STTProvider {
    getName(): string;
    start(options: STTOptions): Promise<void>;
    stop(): void;
    isSupported(): boolean;
    transcribe(audio: Blob, options: STTOptions): Promise<STTResult | null>;
}
