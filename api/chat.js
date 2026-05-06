// Vercel serverless function — DeepSeek API proxy
// Frontend calls /api/chat instead of https://api.deepseek.com/v1/chat/completions
// API key stays on server, never exposed to client

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' })
  }

  try {
    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    })

    if (!upstream.ok) {
      const err = await upstream.text().catch(() => '')
      return res.status(upstream.status).json({ error: `DeepSeek API error: ${upstream.status}`, detail: err })
    }

    // Stream SSE back to the browser
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
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
