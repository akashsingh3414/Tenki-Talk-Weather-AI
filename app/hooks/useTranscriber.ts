"use client"

import { useCallback, useMemo, useState, useRef } from 'react'
import { Transcriber, TranscriberData } from '../../lib/types'
import { sttManager } from '../../lib/stt'

export function useTranscriber(): Transcriber {
  const [output, setOutput] = useState<TranscriberData | undefined>()
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const transcriptRef = useRef<string>('');
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0)
  const [error, setError] = useState<string | undefined>()
  const currentLanguage = useRef<string>("en-US")

  const onInputChange = useCallback(() => {
    setOutput(undefined)
    setInterimTranscript('')
    setError(undefined)
  }, [])

  const startLive = useCallback(async (language: string) => {
    currentLanguage.current = language;
    setError(undefined);

    console.log(`[STT] Starting live recognition (${language})`);

    await sttManager.startHybrid({
      language,
      onResult: (result) => {
        setInterimTranscript(result.text);
        transcriptRef.current = result.text;
      },
      onProgress: (progress) => {
        if (progress.status === 'processing') {
          setIsModelLoading(true);
          setModelLoadingProgress(progress.progress || 0);
        } else if (progress.status === 'started') {
          setIsModelLoading(false);
        } else if (progress.status === 'error') {
          setError(progress.message);
        }
      }
    });
  }, []);

  const processAudioBlob = useCallback(async (audioBlob: Blob, language: string, currentText?: string) => {
    setIsProcessing(true);
    setError(undefined);

    if (currentText && currentText.trim().length >= 2) {
      console.log(`[STT] Using Browser result: "${currentText}"`);
      setOutput({ text: currentText });
      setInterimTranscript(currentText);
      setIsProcessing(false);
      return;
    }

    console.log(`[STT] No browser result, falling back to Cloud (${language})`);

    try {
      const result = await sttManager.finalizeWithFallback(audioBlob, {
        language,
        onResult: (result) => {
          setOutput({ text: result.text });
          setInterimTranscript(result.text);
          setIsProcessing(false);
        },
        onProgress: (progress) => {
          if (progress.status === 'processing') {
            setIsModelLoading(true);
          } else if (progress.status === 'error') {
            setError(progress.message);
            setIsProcessing(false);
          }
        }
      }, currentText);

      if (!result) {
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setIsProcessing(false);
    }
  }, []);

  const stopLive = useCallback(async (audioBlob?: Blob) => {
    console.log("[STT] Stopping... final transcript check:", transcriptRef.current);
    sttManager.stopAll();
    if (audioBlob) {
      await processAudioBlob(audioBlob, currentLanguage.current, transcriptRef.current);
    } else {
      setIsProcessing(false);
    }
  }, [processAudioBlob]);

  const start = useCallback(
    async (audioBlob: Blob | undefined, language: string) => {
      if (audioBlob) {
        setOutput(undefined);
        setError(undefined);
        await processAudioBlob(audioBlob, language);
      }
    },
    [processAudioBlob]
  )

  return useMemo(() => ({
    onInputChange,
    isProcessing,
    isModelLoading,
    modelLoadingProgress,
    start,
    startLive,
    stopLive,
    output,
    interimTranscript,
    error
  }), [
    onInputChange,
    isProcessing,
    isModelLoading,
    modelLoadingProgress,
    start,
    startLive,
    stopLive,
    output,
    interimTranscript,
    error
  ])
}
