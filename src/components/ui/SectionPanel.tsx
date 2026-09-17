import { useEffect } from 'react'
import { useGame, TOUR } from '../../store'
import { profile, skills, projects, experiences, zoneMeta } from '../../data'
import { audio } from '../../audio'

const ZONE_COLORS: Record<string, string> = {
  landing: '#ffd24a',
  skills: '#a855f7',
  projects: '#39ff88',
  career: '#ff2d95',
  hubs: '#00f0ff',
}

// Section sheet: a slim right-side drawer that is always visible while the
// tour is parked on a section. Scroll through sections and it updates in
// place — no keys, no gates, no overlays to hunt for.
export function SectionPanel() {
  const phase = useGame((s) => s.phase)
  const tourSheetOpen = useGame((s) => s.tourSheetOpen)
  const setTourSheetOpen = useGame((s) => s.setTourSheetOpen)
  const tourIndex = useGame((s) => s.tourIndex)
  const setProjectDetail = useGame((s) => s.setProjectDetail)
  const setContactOpen = useGame((s) => s.setContactOpen)

  const close = () => {
    audio.uiClick()
    setTourSheetOpen(false)
  }

  // Esc closes the sheet (only in flow)
  useEffect(() => {
    if (!tourSheetOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourSheetOpen])

  if (phase !== 'playing' || !tourSheetOpen || tourIndex < 0) return null
  const zone = TOUR[tourIndex]
  const color = ZONE_COLORS[zone] ?? '#00f0ff'
  const label = zoneMeta.find((z) => z.id === zone)?.label ?? zone.toUpperCase()

  return (
    <div
      data-ui
      className="absolute bottom-24 right-3 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] z-[25] flex flex-col rounded border bg-space-950/80 backdrop-blur-xl overflow-hidden animate-slide-in"
      style={{ borderColor: `${color}44`, boxShadow: `0 0 40px rgba(0,0,0,0.55)` }}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5">
        <div>
          <p className="font-mono text-[9px] tracking-[0.35em] text-slate-400">SECTION {tourIndex + 1}/5</p>
          <h3 className="font-display text-xl font-black leading-tight" style={{ color, textShadow: `0 0 20px ${color}66` }}>
            {label}
          </h3>
        </div>
        <button aria-label="Close" onClick={close} className="px-2.5 py-1 rounded border border-slate-600 text-slate-300 font-mono text-xs hover:border-neon-cyan hover:text-neon-cyan transition">
          ✕
        </button>
      </div>
      <div className="px-4 py-3 overflow-y-auto cyber-scroll" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
        {zone === 'landing' && <LandingBody />}
        {zone === 'skills' && <SkillsBody />}
        {zone === 'projects' && <ProjectsBody color={color} onOpen={setProjectDetail} />}
        {zone === 'career' && <CareerBody />}
        {zone === 'hubs' && <HubsBody color={color} onContact={() => setContactOpen(true)} />}
      </div>
    </div>
  )
}

// ---------- content (compact) ----------

function LandingBody() {
  return (
    <div>
      <p className="text-slate-200 text-sm leading-relaxed">{profile.bio}</p>
      <p className="mt-2 font-mono text-[10px] text-slate-400">🎓 {profile.education} · ⚲ {profile.location}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <a href={`mailto:${profile.email}`} className="px-2.5 py-1 rounded border border-slate-600 font-mono text-[10px] text-slate-300 hover:border-neon-cyan hover:text-neon-cyan transition">✉</a>
        {profile.socials.map((s) => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded border border-slate-600 font-mono text-[10px] text-slate-300 hover:border-neon-cyan hover:text-neon-cyan transition">
            {s.label.toUpperCase()}
          </a>
        ))}
      </div>
    </div>
  )
}

function SkillsBody() {
  return (
    <div className="space-y-2.5">
      {skills.map((s) => (
        <div key={s.id} className="flex items-center gap-3">
          <span className="w-6 text-center" style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}>{s.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-sm font-bold truncate" style={{ color: s.color }}>{s.name}</span>
              <span className="font-mono text-[9px] text-slate-500">{s.years}y</span>
            </div>
            <div className="h-1 rounded bg-space-700/60 mt-1 overflow-hidden">
              <div className="h-full rounded" style={{ width: `${s.mastery}%`, background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsBody({ color, onOpen }: { color: string; onOpen: (id: string) => void }) {
  return (
    <div className="space-y-2">
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => { audio.uiClick(); onOpen(p.id) }}
          className="w-full text-left rounded border bg-space-950/50 px-3 py-2 transition hover:-translate-y-0.5"
          style={{ borderColor: `${p.color}33`, boxShadow: `inset 0 0 0 1px transparent` }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-sm font-bold truncate" style={{ color: p.color }}>{p.title}</span>
            <span className="font-mono text-[9px] shrink-0" style={{ color }}>→</span>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{p.highlight}</p>
        </button>
      ))}
      <p className="text-center font-mono text-[9px] text-slate-500 pt-1">open a card for the full breakdown</p>
    </div>
  )
}

function CareerBody() {
  return (
    <div className="space-y-2.5">
      {experiences.map((e) => (
        <div key={e.id} className="rounded border bg-space-950/50 px-3 py-2" style={{ borderColor: `${e.color}22` }}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-sm font-bold" style={{ color: e.color }}>{e.company}</span>
            <span className="font-mono text-[9px] text-slate-500 shrink-0">{e.period}</span>
          </div>
          <p className="font-mono text-[10px] text-slate-300 mt-0.5">{e.role}</p>
          <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{e.bullets[0]}</p>
        </div>
      ))}
    </div>
  )
}

function HubsBody({ color, onContact }: { color: string; onContact: () => void }) {
  return (
    <div className="space-y-2">
      {[
        { t: 'OPEN CHANNEL', d: 'AI companion + contact form', a: onContact },
        { t: 'CAREERS', d: 'Open to opportunities', a: onContact },
        { t: 'CTF LAB', d: 'Challenges — soon', a: null },
      ].map((h) => (
        h.a ? (
          <button key={h.t} onClick={() => { audio.uiClick(); h.a!() }} className="w-full text-left rounded border px-3 py-2 transition hover:-translate-y-0.5" style={{ borderColor: `${color}55` }}>
            <p className="font-display text-sm font-black" style={{ color, textShadow: `0 0 12px ${color}55` }}>{h.t}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{h.d}</p>
          </button>
        ) : (
          <div key={h.t} className="rounded border px-3 py-2 opacity-60" style={{ borderColor: `${color}22` }}>
            <p className="font-display text-sm font-black" style={{ color }}>{h.t}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">{h.d}</p>
          </div>
        )
      ))}
    </div>
  )
}