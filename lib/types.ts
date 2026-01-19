export interface TranscriberData {
    text: string
}

export interface Transcriber {
    onInputChange: () => void
    isProcessing: boolean
    isModelLoading: boolean
    modelLoadingProgress: number
    start: (audioData: Blob | undefined, language: string) => Promise<void>
    startLive: (language: string) => Promise<void>
    stopLive: (audioData?: Blob, currentText?: string) => void
    output?: TranscriberData
    interimTranscript?: string
    error?: string
}
