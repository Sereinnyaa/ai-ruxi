import { useState, useRef, useEffect, useCallback } from 'react'

// Calls go to the Vercel serverless proxy /api/tts (or Vite proxy in dev)
// API key stays on server — never exposed to the browser
const TTS_API_URL = '/api/tts'

const SPEAKER = 'S_brgaupV12'

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
  }
}

// Strip parenthetical content: （轻声）, (叹息), etc.
function stripParentheses(text) {
  return text.replace(/[（(][^）)]*[）)]/g, '')
}

export default function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioCtxRef = useRef(null)
  const sourcesRef = useRef([]) // all active BufferSources for streaming
  const abortRef = useRef(null)
  const mountedRef = useRef(true)

  const unlockAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    console.log('[TTS] AudioContext unlocked, state:', audioCtxRef.current.state)
  }, [])

  const stopAllSources = useCallback(() => {
    for (const src of sourcesRef.current) {
      try { src.stop() } catch {}
    }
    sourcesRef.current = []
  }, [])

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    stopAllSources()
    setIsSpeaking(false)
  }, [stopAllSources])

  const speak = useCallback(async (text) => {
    if (!text?.trim()) return

    stop()

    // Remove parenthetical content before TTS
    const cleanText = stripParentheses(text)
    console.log('[TTS] speak() called, text length:', text.length,
      '→ cleaned:', cleanText.length)

    const controller = new AbortController()
    abortRef.current = controller
    setIsSpeaking(true)

    const body = {
      user: { uid: 'ai-ruxi' },
      req_params: {
        text: cleanText,
        speaker: SPEAKER,
        audio_params: {
          format: 'mp3',
          sample_rate: 24000,
        },
        additions: JSON.stringify({
          explicit_language: 'zh',
          disable_markdown_filter: true,
        }),
      },
    }

    try {
      const response = await fetch(TTS_API_URL, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '')
        throw new Error(`TTS API error: ${response.status} - ${bodyText}`)
      }

      // Ensure AudioContext ready
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let nextTime = ctx.currentTime + 0.05 // small scheduling buffer
      let chunkCount = 0
      const chunkQueue = []
      let processRunning = false

      const base64ToArray = (b64) => {
        const bin = atob(b64)
        const arr = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) {
          arr[i] = bin.charCodeAt(i)
        }
        return arr
      }

      // Sequential decoder: ensure decodeAudioData never overlaps
      const processQueue = async () => {
        if (processRunning) return
        processRunning = true
        while (chunkQueue.length > 0 && mountedRef.current) {
          const b64 = chunkQueue.shift()
          const arr = base64ToArray(b64)
          if (!arr.length) continue

          const audioBuffer = await ctx.decodeAudioData(arr.buffer.slice(0, arr.byteLength))
          const source = ctx.createBufferSource()
          source.buffer = audioBuffer
          source.connect(ctx.destination)

          const startTime = Math.max(nextTime, ctx.currentTime)
          source.start(startTime)
          nextTime = startTime + audioBuffer.duration
          chunkCount++

          sourcesRef.current.push(source)
          source.onended = () => {
            sourcesRef.current = sourcesRef.current.filter(s => s !== source)
          }
        }
        processRunning = false
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          try {
            const parsed = JSON.parse(trimmed)
            if (parsed.code === 0 && parsed.data) {
              chunkQueue.push(parsed.data)
              processQueue() // kick off, won't overlap
            }
          } catch {
            // Skip non-JSON
          }
        }
      }

      // Final drain: ensure queue is fully processed
      while (processRunning) {
        await new Promise(r => setTimeout(r, 50))
      }
      processQueue()
      // Wait again for the final batch
      await new Promise(r => setTimeout(r, 100))
      while (processRunning) {
        await new Promise(r => setTimeout(r, 50))
      }

      // Wait for all scheduled sources to finish playing
      while (sourcesRef.current.length > 0 && mountedRef.current) {
        await new Promise(r => setTimeout(r, 200))
      }

      if (chunkCount > 0) {
        console.log('[TTS] All chunks played, chunks:', chunkCount)
        setIsSpeaking(false)
      } else {
        console.warn('[TTS] No audio chunks received')
        setIsSpeaking(false)
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[TTS] Aborted')
        return
      }
      console.error('[TTS] Fatal error:', err)
      if (mountedRef.current) {
        setIsSpeaking(false)
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }, [stop, stopAllSources])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stop()
    }
  }, [stop])

  return { speak, stop, isSpeaking, unlockAudio }
}
