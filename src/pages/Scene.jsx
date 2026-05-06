import { useNavigate, useParams } from 'react-router-dom'

const characterScenes = {
  shenmo: {
    name: '沈墨',
    scenes: [
      {
        id: 'railroad',
        title: '铁道约会',
        time: '1997年 · 秋',
        description:
          '王阳带她来铁道边，聊他爸是火车司机，聊各自想要的未来。她说了那句话——"有些东西，只能喜欢，能喜欢就已经够了。"王阳没听懂，她也没打算让他懂。',
        image: '/scene-railroad.png',
        imageColor: 'from-amber-950 to-stone-950',
      },
      {
        id: 'birthday',
        title: '录像厅生日',
        time: '1998年 · 春',
        description:
          '傅卫军把BB机塞到她手里，比划着：咱俩是一样的，我可以找到你，你也可以找到我。她许愿，祝我们都可以长命百岁，蜡烛却没吹灭。',
        image: '/scene-birthday.jpg',
        imageColor: 'from-indigo-950 to-slate-950',
      },
      {
        id: 'riverside',
        title: '河边送别',
        time: '1998年 · 冬',
        description:
          '军儿被抓走了，她现在只有王阳了，可她们终究还是不一样。她让王阳走，王阳真转身走了，她低头笑了，从桥上跳了下去。',
        image: '/scene-riverside.jpg',
        imageColor: 'from-slate-950 to-zinc-950',
      },
    ],
  },
}

export default function Scene() {
  const navigate = useNavigate()
  const { characterId } = useParams()
  const character = characterScenes[characterId]

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-cinematic-muted">角色不存在</p>
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <button
            onClick={() => navigate('/characters')}
            className="text-cinematic-muted hover:text-cinematic-gold transition-colors text-sm tracking-widest"
          >
            ← 返回选角
          </button>
          <h2 className="text-3xl md:text-4xl font-serif tracking-[0.15em] text-white">
            {character.name} · 记忆碎片
          </h2>
          <p className="text-cinematic-muted text-sm tracking-widest">
            选择一段回忆，走进她的世界
          </p>
        </div>

        {/* Scene cards */}
        <div className="space-y-6">
          {character.scenes.map((scene, index) => (
            <div
              key={scene.id}
              onClick={() => navigate(`/experience/${characterId}/${scene.id}`)}
              className="group relative flex flex-col md:flex-row gap-6 p-6 border border-cinematic-border/50
                         hover:border-cinematic-gold/40 cursor-pointer transition-all duration-500"
            >
              {/* Scene image */}
              <div className={`
                w-full md:w-48 h-32 md:h-auto flex-shrink-0 overflow-hidden border border-white/5
                ${scene.image ? '' : `bg-gradient-to-br ${scene.imageColor} flex items-center justify-center`}
              `}>
                {scene.image ? (
                  <img
                    src={scene.image}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-cinematic-muted/40 text-2xl font-serif">
                    第{index + 1}幕
                  </span>
                )}
              </div>

              {/* Scene info */}
              <div className="flex-1 flex flex-col justify-center space-y-3">
                <span className="text-xs text-cinematic-gold/60 tracking-[0.2em]">
                  {scene.time}
                </span>
                <h3 className="text-xl font-serif tracking-widest text-white group-hover:text-cinematic-gold transition-colors">
                  {scene.title}
                </h3>
                <p className="text-sm text-cinematic-muted leading-relaxed">
                  {scene.description}
                </p>
                <div className="pt-2">
                  <span className="text-xs text-cinematic-gold/40 tracking-[0.2em] group-hover:text-cinematic-gold/80 transition-colors">
                    进入体验 →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
