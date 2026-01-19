export interface STTResult {
    text: string;
    isFinal: boolean;
    confidence?: number;
}

export interface STTProgress {
    status: 'loading' | 'started' | 'processing' | 'error';
    message?: string;
    progress?: number;
}

export type STTCallback = (result: STTResult) => void;
export type ProgressCallback = (progress: STTProgress) => void;

export interface STTOptions {
    language: string;
    onResult: STTCallback;
    onProgress?: ProgressCallback;
}
