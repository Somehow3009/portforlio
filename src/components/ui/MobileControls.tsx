import { useEffect, useState } from 'react'
import { useGame } from '../../store'
import { stepSection } from '../world/TourController'
import { audio } from '../../audio'

export function MobileControls() {
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && 'ontouchstart' in window,
  )
  const tourIndex = useGame((s) => s.tourIndex)
  const tourSheetOpen = useGame((s) => s.tourSheetOpen)

  useEffect(() => {
    if (!isTouch) return
    // enable pointer events styles for the touch layer
    const el = document.getElementById('joyzone')
    if (el) {
      el.classList.add('touch-visible')
    }
  }, [isTouch])

  if (!isTouch) return null

  const step = (dir: 1 | -1) => {
    audio.uiClick()
    stepSection(dir)
  }

  return (
    <>
      {/* Virtual joystick layer */}
      <div
        id="joyzone"
        className="absolute inset-0 z-20 touch-none opacity-0 transition-opacity duration-200 pointer-events-auto"
        style={{
          cursor: 'grab',
          background:
            'radial-gradient(circle at center, rgba(0,240,255,0.06), transparent 40%)',
        }}
      />
      {/* Section stepper: the touch equivalent of scroll / Tab */}
      <div className="absolute bottom-6 inset-x-0 z-40 flex justify-center gap-3 pointer-events-none">
        <button
          aria-label="Previous section"
          onClick={() => step(-1)}
          className="pointer-events-auto w-12 h-12 rounded-full border border-neon-cyan/50 bg-space-900/80 font-mono text-lg text-neon-cyan active:scale-95 transition"
        >
          ◀
        </button>
        <div className="pointer-events-none self-center px-3 py-1.5 rounded border border-neon-cyan/30 bg-space-900/70 font-mono text-[11px] text-neon-cyan">
          {tourIndex >= 0 ? `SEC ${tourIndex + 1}/5` : 'DRAG · TAP LABELS'}
        </div>
        <button
          aria-label="Next section"
          onClick={() => step(1)}
          className="pointer-events-auto w-12 h-12 rounded-full border border-neon-cyan/50 bg-space-900/80 font-mono text-lg text-neon-cyan active:scale-95 transition"
        >
          ▶
        </button>
      </div>
      {/* Interaction hint (hidden while the section sheet is open) */}
      {!tourSheetOpen && (
        <div className="absolute bottom-24 right-3 z-40 flex flex-col items-end gap-2 pointer-events-none">
          <span className="px-3 py-1.5 rounded border border-neon-cyan/30 bg-space-900/70 font-mono text-[11px] text-neon-cyan">
            Drag to look · tap a label
          </span>
        </div>
      )}
    </>
  )
}
