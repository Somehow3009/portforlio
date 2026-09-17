import { useEffect, useRef, useState } from 'react'
import { useGame, TOUR } from '../../store'
import { zoneMeta } from '../../data'

const ZONE_COLORS: Record<string, string> = {
  landing: '#ffd24a',
  skills: '#a855f7',
  projects: '#39ff88',
  career: '#ff2d95',
  hubs: '#00f0ff',
}

// Big cinematic section/zone title when the head lands on a new constellation.
export function ZoneAnnounce() {
  const currentZone = useGame((s) => s.currentZone)
  const tourIndex = useGame((s) => s.tourIndex)
  const phase = useGame((s) => s.phase)
  const [zone, setZone] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const prev = useRef<string | null>(null)
  const hideTimer = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'playing' || !currentZone) return
    if (prev.current === currentZone) return
    prev.current = currentZone
    setZone(currentZone)
    setVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setVisible(false), 2200)
  }, [currentZone, phase])

  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
  }, [])

  if (!zone || phase !== 'playing') return null
  const meta = zoneMeta.find((z) => z.id === zone)
  const color = ZONE_COLORS[zone] ?? '#00f0ff'
  const sectionNo = tourIndex >= 0 ? Math.max(0, TOUR.indexOf(zone as never)) + 1 : null

  return (
    <div
      className={`pointer-events-none absolute top-16 inset-x-0 z-20 flex justify-center transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      }`}
    >
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-[0.5em] mb-1" style={{ color }}>
          {sectionNo ? `SECTION ${sectionNo}/${TOUR.length}` : 'CURRENT ZONE'}
        </p>
        <h3
          className="font-display text-3xl sm:text-4xl font-black text-white"
          style={{ textShadow: `0 0 25px ${color}`, color }}
        >
          {meta?.label ?? zone.toUpperCase()}
        </h3>
        <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color }} />
      </div>
    </div>
  )
}