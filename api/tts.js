// Vercel serverless function — ByteDance TTS proxy
// Frontend calls /api/tts instead of https://openspeech.bytedance.com/api/v3/tts/unidirectional
// API key stays on server, never exposed to client

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.DOUBAO_TTS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'DOUBAO_TTS_API_KEY not configured' })
  }

  const resourceId = process.env.DOUBAO_TTS_RESOURCE_ID || 'seed-icl-2.0'

  try {
    const upstream = await fetch('https://openspeech.bytedance.com/api/v3/tts/unidirectional', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'X-Api-Resource-Id': resourceId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    if (!upstream.ok) {
      const err = await upstream.text().catch(() => '')
      return res.status(upstream.status).json({ error: `TTS API error: ${upstream.status}`, detail: err })
    }

    // Stream JSON lines (base64 audio chunks) back
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }

    res.end()
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' })
    } else {
      res.end()
    }
  }
}
