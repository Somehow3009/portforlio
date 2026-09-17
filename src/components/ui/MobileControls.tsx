import { useEffect, useState } from 'react'

export function MobileControls() {
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && 'ontouchstart' in window,
  )

  useEffect(() => {
    if (!isTouch) return
    // enable pointer events styles for the touch layer
    const el = document.getElementById('joyzone')
    if (el) {
      el.classList.add('touch-visible')
    }
  }, [isTouch])

  if (!isTouch) return null

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
      {/* Interaction hint */}
      <div className="absolute bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
        <span className="px-3 py-1.5 rounded border border-neon-cyan/30 bg-space-900/70 font-mono text-xs text-neon-cyan">
          Drag to look around · swipe to explore
        </span>
      </div>
    </>
  )
}
