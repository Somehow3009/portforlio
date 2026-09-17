import { useEffect, useCallback } from 'react'
import { useGame } from '../../store'
import { projects } from '../../data'
import { audio } from '../../audio'

export function ProjectDetailPanel() {
  const projectDetail = useGame((s) => s.projectDetail)
  const setProjectDetail = useGame((s) => s.setProjectDetail)

  const project = projects.find((p) => p.id === projectDetail)

  const close = useCallback(() => {
    audio.uiClick()
    setProjectDetail(null)
  }, [setProjectDetail])

  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, close])

  if (!project) return null

  return (
    <div data-ui className="absolute inset-0 z-30 flex items-center justify-center bg-space-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-xl border bg-space-900/95 p-7 shadow-[0_0_80px_rgba(57,255,136,0.15)] animate-panel-in"
        style={{ borderColor: `${project.color}66` }}
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
              background: `${project.color}22`,
              border: `1px solid ${project.color}66`,
              color: project.color,
              boxShadow: `0 0 20px ${project.color}44`,
            }}
          >
            ◈
          </div>
          <div>
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: project.color, textShadow: `0 0 20px ${project.color}66` }}
            >
              {project.title}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">{project.description}</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <Row label="PROBLEM" color={project.color}>{project.problem}</Row>
          <Row label="SOLUTION" color={project.color}>{project.solution}</Row>
          <div className="rounded border border-slate-700/60 bg-space-800/50 p-3">
            <p className="font-mono text-xs text-slate-400 mb-2">HIGHLIGHT</p>
            <p className="text-slate-200">{project.highlight}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-slate-400 mb-2">TECH STACK</p>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-xs font-mono border"
                  style={{
                    borderColor: `${project.color}55`,
                    color: project.color,
                    background: `${project.color}11`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              onClick={() => audio.send()}
              className="px-6 py-3 rounded-sm font-mono font-bold text-black transition-all hover:scale-105"
              style={{ background: project.color, boxShadow: `0 0 30px ${project.color}66` }}
            >
              ▶ LAUNCH LIVE DEMO
            </a>
          )}
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            onClick={() => audio.uiClick()}
            className="px-6 py-3 rounded-sm font-mono font-semibold border border-slate-500 text-slate-200 hover:border-white transition-colors"
          >
            VIEW ON GITHUB
          </a>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  color,
  children,
}: {
  label: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded border border-slate-700/60 bg-space-800/50 p-3">
      <p className="font-mono text-xs mb-1" style={{ color }}>{label}</p>
      <p className="text-slate-200 leading-relaxed">{children}</p>
    </div>
  )
}
