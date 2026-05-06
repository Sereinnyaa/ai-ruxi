import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-cinematic-gold/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-1 h-32 bg-gradient-to-b from-transparent via-cinematic-gold/20 to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-1 h-32 bg-gradient-to-b from-transparent via-cinematic-gold/20 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-10">
        {/* Drama title badge */}
        <div className="inline-block px-4 py-1.5 border border-cinematic-gold/30 rounded-full text-cinematic-gold/80 text-sm tracking-[0.2em]">
          漫长的季节
        </div>

        {/* Product name */}
        <h1 className="text-6xl md:text-7xl font-serif font-bold tracking-[0.15em] text-white">
          AI<span className="text-cinematic-gold">入戏</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-cinematic-muted tracking-[0.3em] font-light">
          和剧中人面对面
        </p>

        {/* Enter button */}
        <button
          onClick={() => navigate('/characters')}
          className="group relative px-10 py-4 bg-transparent border border-cinematic-gold/50 text-cinematic-gold
                     hover:bg-cinematic-gold/10 hover:border-cinematic-gold transition-all duration-500
                     tracking-[0.2em] text-base font-light"
        >
          <span className="relative z-10">进入体验</span>
          <div className="absolute inset-0 bg-cinematic-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>

        {/* Bottom decorative line */}
        <div className="flex items-center gap-3 justify-center pt-4">
          <div className="w-8 h-px bg-cinematic-gold/30" />
          <div className="w-1 h-1 rounded-full bg-cinematic-gold/50" />
          <div className="w-16 h-px bg-cinematic-gold/30" />
          <div className="w-1 h-1 rounded-full bg-cinematic-gold/50" />
          <div className="w-8 h-px bg-cinematic-gold/30" />
        </div>
      </div>
    </div>
  )
}
