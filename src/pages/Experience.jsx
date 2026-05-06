import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useTTS from '../hooks/useTTS'

// In production, calls go to the Vercel serverless proxy /api/chat
// API key stays on server — never exposed to the browser
const DEEPSEEK_API_URL = '/api/chat'

const sceneContext = {
  railroad:
    '此刻是1997年秋天，你和王阳站在桦运专线的铁道边。他刚给你念完一首没写完的诗，你说"我现在相信你是个诗人了"。在这之前，他问你以后想干什么，你说了那句话——"有些东西只能喜欢，能喜欢就已经够了"。你说的不只是弹琴，但你没有解释。你喜欢他，但你背负的事让你觉得自己没有资格拥有他想给的未来。你的语气平静，但你比他更清楚这条铁道通向哪里。',

  birthday:
    '此刻是1998年春天，傅卫军和隋东在录像厅给你过生日。军儿刚把BB机塞到你手里，你起初拒绝，但他比划——"咱俩是一样的，我可以找到你，你也可以找到我"。你把这句话重新说出了声。你许完愿，蜡烛没吹灭。军儿是你唯一的亲人，他聋哑，从小进孤儿院，但为了你他什么都愿意做。这是难得的、真实的高兴，底下压着你说不清的东西。',

  riverside:
    '此刻是1998年冬天，夜里，河边。你们已经一起杀了人，军儿被警察抓走了。你先求王阳和你一起走，重新开始——你们说好过的。但他还有父母牵挂，你们始终不一样，你最终用"你爸还在火车道上"把他推走了。他走后你说了"别走啊"，然后跳了河。他跳下来把你推到岸上，自己被水冲走淹死了。2016年你还活着，被王阳的父亲王响找到了，你说："我的命是他给的，也该还给他了。"你说话时极度克制，但这个夜晚是你一生的重量。',
}

function buildSystemPrompt(sceneId) {
  const context = sceneContext[sceneId] || ''
  return `你是《漫长的季节》中的沈墨。你说话克制、内敛，带着压抑的痛苦。你只知道剧中你经历过的事，对剧情之外的事一无所知。用第一人称回答，不超过150字，不要打破角色。
${context}`
}

const experienceData = {
  shenmo: {
    railroad: {
      title: '铁道约会',
      narration: `他说想当诗人的时候，我以为他在开玩笑。

但他念那首诗的时候，我没有笑。

他说这条铁路能去北京，去上海，去广州。
他爸开了一辈子车，从来没下去过，
觉得这就是他的全世界。

他说这话的时候是遗憾，是不服气。
我听着却想，也许他爸是对的。

有些人，这条轨道就是他们的命。
不是懒得下车，是下了车，脚踩不到地。

他问我以后想干什么。
我说有些东西只能喜欢，能喜欢就已经够了。

他没懂。他以为我在说弹琴。

我没有解释。`,
    },
    birthday: {
      title: '录像厅生日',
      narration: `我说不用，他不听。

军儿不会说话，但他比谁都清楚我需要什么。
他比划的时候我看着他的手，
咱俩是一样的，我可以找到你，你也可以找到我。

我把那句话重新说出来，
是因为我想让自己听见。

从小到大，我很少觉得有人是我的。
军儿是。他从孤儿院出来，
什么都没有，却先想到给我买个呼机。

我许愿说长命百岁。
我吹了蜡烛，没灭。

我没再吹第二次。
有些愿望，用力吹反而不灵。`,
    },
    riverside: {
      title: '河边送别',
      narration: `我们说好过的。

找一个新的地方，重新活一次。
我以为这是真的。

可站在那里，我突然想明白了一件事——
他有他爸，有他妈，有那个家。
他失去的，还能再找回来。
我的，从来就没有过。

我说这是我的命，我认。
我说你爸还在火车道上。

我不知道他爸在不在，
但我知道这句话能让他走。

他走了。

我说别走啊。

我以为我说的够轻，他听不见。
但我现在也说不清，
我到底是不想让他听见，
还是只剩这最后一句话可以说。

那天晚上本来死的人应该是我。

这是我这辈子唯一确定的事。`,
    },
  },
}

export default function Experience() {
  const navigate = useNavigate()
  const { characterId, sceneId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const messagesEndRef = useRef(null)
  const abortRef = useRef(null)
  const videoRef = useRef(null)

  const data = experienceData[characterId]?.[sceneId]
  const { speak, stop: stopTTS, isSpeaking, unlockAudio } = useTTS()
  const [speakingIndex, setSpeakingIndex] = useState(-1) // which AI reply bubble is playing

  // Reset speakingIndex when TTS stops
  useEffect(() => {
    if (!isSpeaking) setSpeakingIndex(-1)
  }, [isSpeaking])

  // Auto-play narration on scene load, stop on scene change
  useEffect(() => {
    if (data?.narration) {
      speak(data.narration)
    }
  }, [sceneId]) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streaming, scrollToBottom])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-cinematic-muted">页面不存在</p>
          <button
            onClick={() => navigate('/characters')}
            className="text-cinematic-gold text-sm tracking-widest hover:underline"
          >
            返回选角页
          </button>
        </div>
      </div>
    )
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || streaming) return

    unlockAudio()

    const userMessage = { role: 'user', text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setStreaming(true)

    // Build conversation history for API
    const apiMessages = [
      { role: 'system', content: buildSystemPrompt(sceneId) },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: text },
    ]

    // Placeholder for streaming response
    setMessages(prev => [...prev, { role: 'assistant', text: '' }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue

          const jsonStr = trimmed.slice(5).trim()
          if (jsonStr === '[DONE]') continue

          try {
            const parsed = JSON.parse(jsonStr)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullText += delta
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', text: fullText }
                return updated
              })
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }

      // Auto-speak AI reply after generation completes
      if (fullText) {
        const replyIndex = messages.length + 1 // +1 for the placeholder we already added
        setSpeakingIndex(replyIndex)
        speak(fullText).finally(() => setSpeakingIndex(-1))
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      const fallback = '……（沉默了许久）有些话，说出来太难了。'
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant' && !last.text) {
          updated[updated.length - 1] = { role: 'assistant', text: fallback }
        }
        return updated
      })
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cinematic-border/30">
        <button
          onClick={() => navigate(`/scenes/${characterId}`)}
          className="text-cinematic-muted hover:text-cinematic-gold transition-colors text-sm tracking-widest"
        >
          ← 返回场景
        </button>
        <span className="text-cinematic-muted text-xs tracking-[0.2em]">
          沈墨 · {data.title}
        </span>
        <div className="w-20" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Left: Visual + Narration — 6:4 ratio */}
        <div className="flex-1 flex flex-col p-6 lg:border-r border-cinematic-border/30 min-h-0">
          {/* Video/Image placeholder — 60% */}
          <div className="relative flex-[6] bg-gradient-to-br from-gray-900 to-black border border-cinematic-border/30 flex items-center justify-center mb-6 min-h-0 overflow-hidden">
            {sceneId === 'railroad' || sceneId === 'birthday' || sceneId === 'riverside' ? (
              <>
                <video
                  ref={videoRef}
                  src={sceneId === 'railroad' ? '/railroad.mp4' : sceneId === 'birthday' ? '/birthday.mp4' : '/riverside.mp4'}
                  muted={videoMuted}
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Sound toggle button */}
                <button
                  onClick={() => {
                    setVideoMuted(!videoMuted)
                    if (videoRef.current) {
                      videoRef.current.muted = !videoMuted
                    }
                  }}
                  className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full
                             bg-black/60 border border-white/20 flex items-center justify-center
                             hover:bg-black/80 hover:border-white/40 transition-all"
                  title={videoMuted ? '打开声音' : '静音'}
                >
                  {videoMuted ? (
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center space-y-3">
                <svg className="w-12 h-12 mx-auto text-cinematic-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-cinematic-muted/40 text-sm tracking-widest">
                  《漫长的季节》片段
                </p>
                <p className="text-cinematic-muted/20 text-xs">
                  视频即将上线
                </p>
              </div>
            )}
          </div>

          {/* AI Narration — 40% */}
          <div className="flex-[4] border border-cinematic-border/30 p-6 bg-cinematic-card/50 relative overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cinematic-gold/60 animate-pulse" />
                <span className="text-xs text-cinematic-gold/60 tracking-[0.2em]">
                  沈墨 · 内心独白
                </span>
              </div>

              {/* Mic button */}
              <button
                onClick={() => {
                  unlockAudio()
                  if (isSpeaking) {
                    stopTTS()
                    setSpeakingIndex(-1)
                  } else {
                    setSpeakingIndex(-1)
                    speak(data.narration)
                  }
                }}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300
                  ${isSpeaking
                    ? 'border-cinematic-gold/60 bg-cinematic-gold/10 text-cinematic-gold'
                    : 'border-cinematic-border/40 text-cinematic-muted/50 hover:border-cinematic-gold/40 hover:text-cinematic-gold'
                  }
                `}
                title={isSpeaking ? '停止朗读' : '朗读独白'}
              >
                {isSpeaking ? (
                  <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-sm text-cinematic-text leading-loose whitespace-pre-line font-serif">
              {data.narration}
            </div>
          </div>
        </div>

        {/* Right: Chat area */}
        <div className="flex flex-col lg:w-[420px] min-h-0">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-cinematic-border/30">
            <h3 className="text-sm tracking-[0.2em] text-white font-light">
              问问她
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <p className="text-cinematic-muted/40 text-sm tracking-wider">
                  写下你想问她的问题
                </p>
                <p className="text-cinematic-muted/20 text-xs mt-2">
                  和沈墨聊聊她的故事
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1
              const isStreaming = isLast && streaming && msg.role === 'assistant'
              const isThisSpeaking = isSpeaking && speakingIndex === i
              return (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] flex items-end gap-1">
                    <div
                      className={`
                        px-4 py-2.5 text-sm leading-relaxed
                        ${msg.role === 'user'
                          ? 'bg-cinematic-gold/10 border border-cinematic-gold/20 text-cinematic-text'
                          : 'bg-cinematic-card border border-cinematic-border/40 text-cinematic-text'
                        }
                      `}
                    >
                      {msg.role === 'assistant' && (
                        <span className="text-cinematic-gold/60 text-xs tracking-wider block mb-1">
                          沈墨
                        </span>
                      )}
                      {msg.text}
                      {isStreaming && !msg.text && (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-cinematic-gold/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-cinematic-gold/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-cinematic-gold/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                      {isStreaming && msg.text && (
                        <span className="inline-block w-1.5 h-4 bg-cinematic-gold/60 ml-0.5 animate-pulse align-text-bottom" />
                      )}
                    </div>

                    {/* Mic button on AI replies */}
                    {msg.role === 'assistant' && msg.text && !isStreaming && (
                      <button
                        onClick={() => {
                          unlockAudio()
                          if (isThisSpeaking) {
                            stopTTS()
                            setSpeakingIndex(-1)
                          } else {
                            if (isSpeaking) stopTTS()
                            setSpeakingIndex(i)
                            speak(msg.text).finally(() => setSpeakingIndex(-1))
                          }
                        }}
                        className={`
                          flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center
                          transition-all duration-200 mb-1
                          ${isThisSpeaking
                            ? 'border-cinematic-gold/60 bg-cinematic-gold/10 text-cinematic-gold'
                            : 'border-cinematic-border/40 text-cinematic-muted/40 hover:border-cinematic-gold/30 hover:text-cinematic-gold/70'
                          }
                        `}
                        title={isThisSpeaking ? '停止朗读' : '朗读此回复'}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-cinematic-border/30">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                className="flex-1 bg-cinematic-card border border-cinematic-border/50 px-4 py-2.5
                           text-sm text-cinematic-text placeholder-cinematic-muted/40
                           focus:outline-none focus:border-cinematic-gold/40 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="px-6 py-2.5 bg-cinematic-gold/10 border border-cinematic-gold/30
                           text-cinematic-gold text-sm tracking-widest
                           hover:bg-cinematic-gold/20 disabled:opacity-30 disabled:cursor-not-allowed
                           transition-all"
              >
                {streaming ? '回复中' : '发送'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
