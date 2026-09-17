import { useGame } from '../../store'
import { audio } from '../../audio'
import { profile } from '../../data'

export function IntroScreen() {
  const phase = useGame((s) => s.phase)
  const setPhase = useGame((s) => s.setPhase)
  const setMode = useGame((s) => s.setMode)
  const setLoading = useGame((s) => s.setLoading)

  if (phase !== 'intro') return null

  const begin = (m: '3d' | '2d') => {
    audio.unlock()
    audio.startAmbient()
    audio.whoosh()
    setPhase('playing')
    setMode(m)
    if (m === '3d') {
      setLoading(true)
    }
  }

  return (
    <div data-ui className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-space-950/80 via-transparent to-space-950/90">
      <div className="text-center px-6">
        <p className="text-neon-cyan font-mono text-sm tracking-[0.4em] mb-4 animate-glowpulse">
          WELCOME TO
        </p>
        <h1
          className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white mb-2"
          style={{ textShadow: '0 0 30px rgba(0,240,255,0.5)' }}
        >
          THE DEVELOPER&apos;S
          <span className="text-neon-cyan block">UNIVERSE</span>
        </h1>
        <p className="text-slate-300 text-lg md:text-xl mt-6 max-w-xl mx-auto">
          {profile.name} · {profile.title}
        </p>
        <p className="text-slate-400 text-sm max-w-md mx-auto mt-3 hidden sm:block">
          {profile.bio}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => begin('3d')}
            className="group relative px-10 py-4 font-mono font-bold text-black bg-neon-cyan rounded-sm transition-all hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] hover:scale-105"
          >
            <span className="relative z-10">▶ ENTER 3D WORLD</span>
          </button>
          <button
            onClick={() => begin('2d')}
            className="px-8 py-4 font-mono font-semibold text-neon-cyan border border-neon-cyan/50 rounded-sm transition-colors hover:bg-neon-cyan/10"
          >
            QUICK ACCESS · 2D CV
          </button>
        </div>

        <p className="text-slate-500 text-xs mt-8 font-mono">
          Sections: scroll · Inspect: aim / E · Free look: drag / A·D · desktop recommended
        </p>
      </div>
    </div>
  )
}
