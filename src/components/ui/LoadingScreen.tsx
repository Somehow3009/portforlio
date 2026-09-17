import { useEffect, useRef, useState } from 'react'
import { useGame } from '../../store'
import { audio } from '../../audio'

const LINES = [
  '> Initializing universe voxels...',
  '> Loading experience...',
  '> Adding animations...',
  '> Adding effects...',
  '> Adding lights...',
  '> Compiling shader stars...',
  '> Spawning four islands...',
  '> Connecting bridges...',
  '> Calibrating jetpack...',
  '> Welcome, traveler.',
]

// Terminal-style loading experience (inspired by peachweb.io).
export function LoadingScreen() {
  const loading = useGame((s) => s.loading)
  const [visible, setVisible] = useState(true)
  const [done, setDone] = useState(false)
  const [idx, setIdx] = useState(0)
  const timer = useRef<number | null>(null)

  // progress-by-lines
  useEffect(() => {
    if (!loading) return
    if (idx < LINES.length) {
      timer.current = window.setTimeout(() => {
        setIdx((i) => i + 1)
        audio.hover()
      }, 260)
    } else {
      setDone(true)
      // brief hold then fade out
      timer.current = window.setTimeout(() => {
        useGame.getState().setLoading(false)
        setVisible(false)
      }, 700)
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [idx, loading])

  // hard fade if loading flag cleared externally
  useEffect(() => {
    if (!loading) {
      setVisible(false)
    }
  }, [loading])

  if (!visible) return null

  return (
    <div
      className={`absolute inset-0 z-[45] flex flex-col items-center justify-center bg-space-950 transition-opacity duration-700 ${
        done ? 'opacity-90' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-lg px-6 font-mono text-sm space-y-1.5 h-56 overflow-hidden">
        {LINES.slice(0, idx).map((l, i) => (
          <p
            key={i}
            className={`${i === idx - 1 ? 'text-neon-cyan' : 'text-slate-500'}`}
          >
            {l}
          </p>
        ))}
        <span className="text-neon-cyan animate-blink">▊</span>
      </div>

      <div className="mt-6 w-64 max-w-[80vw] h-1 bg-space-800 rounded overflow-hidden">
        <div
          className="h-full bg-neon-cyan transition-all duration-300 ease-out"
          style={{ width: `${Math.round((idx / LINES.length) * 100)}%` }}
        />
      </div>
      <p className="mt-3 text-neon-cyan/70 font-mono text-xs tracking-[0.3em]">
        {done ? 'SYSTEM READY' : 'BOOTING…'}
      </p>
    </div>
  )
}