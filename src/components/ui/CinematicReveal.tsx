import { useEffect, useRef, useState } from 'react'
import { useGame } from '../../store'
import { audio } from '../../audio'

// Post-load cinematic reveal: oversized title scales/fades in over the 3D
// world ("BEGIN"), then a persistent "SCROLL TO CONTINUE" tour hint.
export function CinematicReveal() {
  const phase = useGame((s) => s.phase)
  const loading = useGame((s) => s.loading)
  const [stage, setStage] = useState<'hidden' | 'show' | 'done'>('hidden')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'playing' || loading) return
    // delay slightly so the first world frame is visible
    timer.current = window.setTimeout(() => setStage('show'), 400)
    const hide = window.setTimeout(() => {
      setStage('done')
      audio.arrive()
    }, 3200)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
      window.clearTimeout(hide)
    }
  }, [phase, loading])

  if (phase !== 'playing' || loading || stage === 'hidden') return null

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center">
      <div
        className={`text-center transition-all duration-[1400ms] ease-out ${
          stage === 'show' ? 'opacity-100 scale-100' : 'opacity-0 scale-125'
        }`}
      >
        <p className="font-mono text-neon-cyan text-sm tracking-[0.5em] mb-3">
          THE DEVELOPER&apos;S UNIVERSE
        </p>
        <h2 className="font-display text-6xl sm:text-8xl font-black text-white drop-shadow-[0_0_40px_rgba(0,240,255,0.6)]">
          BEGIN
        </h2>
        <p className="font-mono text-slate-400 text-sm mt-4">
          Sections: scroll · Inspect: aim / E · Free look: drag / A·D
        </p>
      </div>

      {/* persistent hint */}
      {stage === 'done' && (
        <div className="absolute bottom-10 flex flex-col items-center gap-2 animate-glowpulse">
          <span className="font-mono text-neon-cyan/80 text-xs tracking-[0.4em]">
            SCROLL TO CONTINUE
          </span>
        </div>
      )}
    </div>
  )
}