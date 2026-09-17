import { useEffect, useCallback } from 'react'
import { useGame } from '../../store'
import { experiences } from '../../data'
import { audio } from '../../audio'

export function CareerDetailPanel() {
  const careerDetail = useGame((s) => s.careerDetail)
  const setCareerDetail = useGame((s) => s.setCareerDetail)

  const exp = experiences.find((e) => e.id === careerDetail)

  const close = useCallback(() => {
    audio.uiClick()
    setCareerDetail(null)
  }, [setCareerDetail])

  useEffect(() => {
    if (!exp) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exp, close])

  if (!exp) return null

  return (
    <div data-ui className="absolute inset-0 z-30 flex items-center justify-center bg-space-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-xl border bg-space-900/95 p-7 shadow-[0_0_80px_rgba(255,45,149,0.15)] animate-panel-in"
        style={{ borderColor: `${exp.color}66` }}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-neon-cyan transition-colors font-mono"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
            style={{
              background: `${exp.color}22`,
              border: `1px solid ${exp.color}66`,
              color: exp.color,
              boxShadow: `0 0 20px ${exp.color}44`,
            }}
          >
            ◈
          </div>
          <div>
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: exp.color, textShadow: `0 0 20px ${exp.color}66` }}
            >
              {exp.company}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">{exp.role}</p>
            <p className="font-mono text-xs text-slate-500 mt-0.5">
              {exp.period.toUpperCase()} · CAREER WAYPOINT
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded border border-slate-700/60 bg-space-800/50 p-4">
            <p className="font-mono text-xs text-slate-400 mb-2" style={{ color: exp.color }}>HIGHLIGHTS</p>
            <ul className="space-y-2">
              {exp.bullets.map((b) => (
                <li key={b} className="text-slate-200 leading-relaxed flex gap-2">
                  <span style={{ color: exp.color }}>▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs text-slate-400 mb-2">TECH</p>
            <div className="flex flex-wrap gap-2">
              {exp.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs font-mono border"
                  style={{
                    borderColor: `${exp.color}55`,
                    color: exp.color,
                    background: `${exp.color}11`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}