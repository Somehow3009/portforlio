import { useGame, TOUR } from '../../store'
import { skills, projects, experiences } from '../../data'
import { audio } from '../../audio'

const zoneLabels: Record<string, string> = {
  landing: 'LANDING PLATFORM',
  skills: 'THE SKILL FORGE',
  projects: 'THE PROJECT GALAXY',
  career: 'THE CAREER TRAIL',
  hubs: 'THE INNOVATION HUB',
}

export function HUD() {
  const phase = useGame((s) => s.phase)
  const tourIndex = useGame((s) => s.tourIndex)
  const activeInteraction = useGame((s) => s.activeInteraction)
  const started = useGame((s) => s.started)
  const mode = useGame((s) => s.mode)
  const setMode = useGame((s) => s.setMode)
  const setPhase = useGame((s) => s.setPhase)
  const setProjectDetail = useGame((s) => s.setProjectDetail)
  const setContactOpen = useGame((s) => s.setContactOpen)
  const setTourSheetOpen = useGame((s) => s.setTourSheetOpen)
  const setInteraction = useGame((s) => s.setInteraction)

  if (phase !== 'playing') return null

  const interaction = activeInteraction
  const skill = interaction?.type === 'skill' ? skills.find((s) => s.id === interaction.id) : null
  const project = interaction?.type === 'project' ? projects.find((p) => p.id === interaction.id) : null
  const career = interaction?.type === 'career' ? experiences.find((e) => e.id === interaction.id) : null
  const inTour = tourIndex >= 0
  const section = inTour ? TOUR[tourIndex] : null
  const tourZoneLabel = section ? zoneLabels[section] : null

  const reticleColor = skill?.color ?? project?.color ?? career?.color ?? '#00f0ff'
  const pivLabel =
    interaction?.type === 'project' || interaction?.type === 'career'
      ? '[E / CLICK] INSPECT'
      : interaction?.type === 'skill'
        ? '[VIEW]'
        : interaction?.type === 'terminal'
          ? 'OPEN CHANNEL'
          : ''

  const goHome = () => {
    audio.whoosh()
    setPhase('intro')
    setProjectDetail(null)
    setContactOpen(false)
    setTourSheetOpen(false)
    setInteraction(null)
  }

  return (
    <>
      {/* Logo */}
      <div className="pointer-events-none absolute top-3 left-4 z-40 font-display text-neon-cyan text-sm tracking-widest text-shadow hidden sm:block">
        ◈ DEV&apos;S UNIVERSE
      </div>

      {/* Control cluster */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        {tourZoneLabel && (
          <div className="px-3 py-1.5 rounded border border-neon-amber/40 bg-space-900/70 backdrop-blur text-neon-amber font-mono text-[10px] sm:text-xs tracking-wider animate-glowpulse">
            ◈ SECTION {TOUR.indexOf(section as never) + 1}/{TOUR.length} · {tourZoneLabel}
          </div>
        )}
        <button
          onClick={() => {
            audio.uiClick()
            setMode(mode === '3d' ? '2d' : '3d')
          }}
          aria-label="Toggle 2D mode"
          className="px-2.5 py-1.5 rounded border border-slate-600 text-slate-300 text-xs font-mono hover:border-neon-cyan hover:text-neon-cyan transition"
          title="Toggle low-power mode"
        >
          {mode === '3d' ? '⚡ 2D' : '🌐 3D'}
        </button>
        <button
          onClick={goHome}
          aria-label="Home"
          className="px-2.5 py-1.5 rounded border border-slate-600 text-slate-300 text-xs font-mono hover:border-neon-pink hover:text-neon-pink transition"
          title="Back to title"
        >
          ⌂
        </button>
      </div>

      {!inTour && (
        <>
          {/* First-person gaze reticle (crosshair only) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <Reticle active={!!interaction} color={reticleColor} />
          </div>

          {/* Interaction prompt */}
          {interaction && !started && (
            <div className="absolute bottom-24 inset-x-0 z-20 flex justify-center pointer-events-none">
              <PromptLabel text="Sections: scroll · Inspect: aim / E · Free look: drag / A·D" />
            </div>
          )}

          {interaction && pivLabel && (
            <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center pointer-events-none">
              <PromptLabel text={pivLabel} accent={reticleColor} />
            </div>
          )}
        </>
      )}
    </>
  )
}

function Reticle({ active, color }: { active: boolean; color: string }) {
  const c = active ? color : '#4b5470'
  const s = 26
  return (
    <div
      data-reticle="brackets"
      className="relative"
      style={{
        width: s,
        height: s,
        opacity: active ? 1 : 0.55,
        filter: active ? `drop-shadow(0 0 6px ${color})` : undefined,
        transition: 'opacity 120ms ease',
      }}
    >
      {corner('top-left', c)}
      {corner('top-right', c)}
      {corner('bottom-left', c)}
      {corner('bottom-right', c)}
      <div
        className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full"
        style={{
          background: c,
          boxShadow: active ? `0 0 10px ${color}` : undefined,
          transition: 'background 120ms ease',
        }}
      />
    </div>
  )
}

function corner(pos: string, color: string) {
  const base: Record<string, React.CSSProperties> = {
    'top-left': { top: 0, left: 0, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    'top-right': { top: 0, right: 0, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` },
    'bottom-left': { bottom: 0, left: 0, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    'bottom-right': { bottom: 0, right: 0, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` },
  }
  return <div className="absolute w-2.5 h-2.5" style={base[pos]} key={pos} />
}

function PromptLabel({ text, accent = '#00f0ff' }: { text: string; accent?: string }) {
  return (
    <div
      className="px-5 py-2.5 rounded-sm border font-mono text-sm bg-space-900/80 backdrop-blur"
      style={{ borderColor: `${accent}66`, color: accent }}
    >
      {text}
    </div>
  )
}