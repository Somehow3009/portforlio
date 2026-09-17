import { lazy, Suspense, useEffect } from 'react'
import { useGame } from './store'
import { bindInput } from './components/controls'
import { IntroScreen } from './components/ui/IntroScreen'
import { HUD } from './components/ui/HUD'
import { SkillPanel } from './components/ui/SkillPanel'
import { ProjectDetailPanel } from './components/ui/ProjectDetailPanel'
import { CareerDetailPanel } from './components/ui/CareerDetailPanel'
import { ContactPanel } from './components/ui/ContactPanel'
import { CvView } from './components/ui/CvView'
import { MobileControls } from './components/ui/MobileControls'
import { SectionPanel } from './components/ui/SectionPanel'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { CinematicReveal } from './components/ui/CinematicReveal'
import { ZoneAnnounce } from './components/ui/ZoneAnnounce'

// Code-split the Three.js scene so the intro screen paints instantly.
const Scene = lazy(() =>
  import('./components/Scene').then((m) => ({ default: m.Scene })),
)

export function App() {
  const mode = useGame((s) => s.mode)
  const phase = useGame((s) => s.phase)
  const loading = useGame((s) => s.loading)

  useEffect(() => {
    const unbind = bindInput()
    return unbind
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-space-950 text-white select-none">
      {/* 3D scene (also rendered behind in 2D mode as background, but we hide for perf) */}
      {mode === '3d' && (
        <Suspense fallback={<SceneFallback />}>
          <Scene />
        </Suspense>
      )}

      {/* Terminal-style loading experience on 3D entry */}
      {mode === '3d' && phase === 'playing' && loading && <LoadingScreen />}

      {/* Overlay UI */}
      <IntroScreen />
      <CinematicReveal />
      <ZoneAnnounce />
      {phase === 'playing' && (
        <>
          <HUD />
          <SkillPanel />
          <SectionPanel />
          <ProjectDetailPanel />
          <CareerDetailPanel />
          <ContactPanel />
          <MobileControls />
        </>
      )}
      <CvView />

      {mode === '2d' && phase === 'playing' && (
        <div className="absolute bottom-4 left-4 z-50 text-xs font-mono text-space-500">
          LOW-POWER 2D MODE ACTIVE
        </div>
      )}
    </div>
  )
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <div className="font-mono text-neon-cyan text-sm tracking-[0.3em] animate-glowpulse">
        INITIALIZING UNIVERSE<span className="animate-blink">_</span>
      </div>
    </div>
  )
}
