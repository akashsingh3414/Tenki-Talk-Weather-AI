import { useEffect, useState } from 'react'

export interface MessageEventHandler {
  (event: MessageEvent): void
}

export function useWorker(
  messageEventHandler: MessageEventHandler
): Worker | null {
  const [worker] = useState(() => createWorker(messageEventHandler))

  useEffect(() => {
    return () => {
      if (worker) {
        worker.terminate()
      }
    }
  }, [worker])

  return worker
}

function createWorker(messageEventHandler: MessageEventHandler): Worker | null {
  if (typeof window === 'undefined') return null

  const worker = new Worker('/worker.js', {
    type: 'module'
  })

  worker.addEventListener('message', messageEventHandler)
  return worker
}
