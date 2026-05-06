import { useNavigate } from 'react-router-dom'

const characters = [
  {
    id: 'shenmo',
    name: '沈墨',
    subtitle: '她被困在时间里',
    locked: false,
    image: '/shenmo.jpg',
    borderColor: 'border-rose-700/60 group-hover:border-rose-500/80',
    glowColor: 'bg-rose-500/10 group-hover:bg-rose-500/20',
  },
  {
    id: 'wangyang',
    name: '王阳',
    subtitle: '他写了一首诗',
    locked: true,
    image: '/wangyang.jpg',
    borderColor: 'border-gray-700',
    glowColor: 'bg-blue-500/5',
  },
  {
    id: 'fuweijun',
    name: '傅卫军',
    subtitle: '他守一个约定',
    locked: true,
    image: '/fuweijun.jpg',
    borderColor: 'border-gray-700',
    glowColor: 'bg-amber-500/5',
  },
]

export default function CharacterSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <button
            onClick={() => navigate('/')}
            className="text-cinematic-muted hover:text-cinematic-gold transition-colors text-sm tracking-widest"
          >
            ← 返回首页
          </button>
          <h2 className="text-3xl md:text-4xl font-serif tracking-[0.15em] text-white">
            选择角色
          </h2>
          <p className="text-cinematic-muted text-sm tracking-widest">
            CHOOSE YOUR CHARACTER
          </p>
        </div>

        {/* Character cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {characters.map((char) => (
            <div
              key={char.id}
              onClick={() => {
                if (!char.locked) navigate(`/scenes/${char.id}`)
              }}
              className={`
                group relative flex flex-col items-center p-8 rounded-sm cursor-pointer
                border transition-all duration-500
                ${char.locked
                  ? 'border-cinematic-border/50 cursor-not-allowed opacity-70'
                  : `border-cinematic-border/60 hover:border-cinematic-gold/60 ${char.borderColor}`
                }
              `}
            >
              {/* Glow effect */}
              <div className={`
                absolute inset-0 rounded-sm transition-opacity duration-500 opacity-0
                ${char.locked ? '' : `group-hover:opacity-100 ${char.glowColor}`}
              `} />

              {/* Avatar */}
              <div className={`
                relative w-28 h-28 rounded-full overflow-hidden mb-6 border-2 transition-colors duration-500
                ${char.locked ? 'border-gray-700' : 'border-cinematic-border/50 group-hover:border-cinematic-gold/40'}
              `}>
                <img
                  src={char.image}
                  alt={char.name}
                  className="w-full h-full object-cover"
                />

                {/* Lock icon for locked characters */}
                {char.locked && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-cinematic-card border border-cinematic-border rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-cinematic-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 className="text-2xl font-serif tracking-widest text-white mb-2">
                {char.name}
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-cinematic-muted tracking-wider mb-4">
                {char.subtitle}
              </p>

              {/* Status */}
              {char.locked ? (
                <span className="text-xs text-cinematic-muted/60 tracking-[0.2em]">
                  即将开放
                </span>
              ) : (
                <span className="text-xs text-cinematic-gold/60 tracking-[0.2em] group-hover:text-cinematic-gold transition-colors">
                  点击进入 →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
