import { useEffect } from 'react'
import { useGame, TOUR } from '../../store'
import type { ZoneId } from '../../store'
import { flow } from './cameraShared'
import { audio } from '../../audio'

// Scroll-driven section flow: each deliberate wheel notch turns the head to
// face the next/previous CV constellation (content reveals per spatial
// direction, fixed camera). Before the eased swing to a section settles the
// head is "locked" — a second wheel while still moving is buffered once (not
// queued repeatedly), so fast whips still skip exactly one section per step.
// Pressing any movement key breaks free and resumes manual steering.
const WHEEL_STEP = 120 // accumulated deltaY (px) per section

export function TourController() {
  const setTourIndex = useGame((s) => s.setTourIndex)
  const tourIndex = useGame((s) => s.tourIndex)

  // wheel -> one section step per deliberate notch
  useEffect(() => {
    let acc = 0
    const onWheel = (e: WheelEvent) => {
      // wheel inside an overlay panel scrolls the panel, not the universe
      if ((e.target as HTMLElement | null)?.closest?.('[data-ui]')) {
        acc = 0
        return
      }
      if (flow.locked && flow.pending !== 0) {
        acc = 0
        return
      }
      acc += normalizeWheel(e)
      if (Math.abs(acc) < WHEEL_STEP) return
      const dir: 1 | -1 = acc > 0 ? 1 : -1
      acc = 0
      if (flow.locked) {
        flow.pending = dir
        return
      }
      apply(dir)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [setTourIndex])

  // when the ease has landed, apply the buffered step
  useEffect(() => {
    const id = window.setInterval(() => {
      if (flow.pending !== 0 && !flow.locked) {
        const dir = flow.pending
        flow.pending = 0
        apply(dir)
      }
    }, 80)
    return () => window.clearInterval(id)
  }, [])

  // Tab also advances the guided flow
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const s = useGame.getState()
        if (s.tourIndex < 0) {
          s.setTourIndex(0)
        } else {
          s.setTourIndex(nextIndex(s.tourIndex, 1))
        }
        audio.hover()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setTourIndex])

  // reset to free-roam steering on movement input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        flow.pending = 0
        setTourIndex(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setTourIndex])

  // entering a section opens its content sheet; exiting flow hides it
  useEffect(() => {
    if (tourIndex >= 0) {
      audio.whoosh()
      useGame.getState().setTourSheetOpen(true)
    } else {
      useGame.getState().setTourSheetOpen(false)
    }
  }, [tourIndex])

  return null
}

function apply(dir: 1 | -1) {
  const s = useGame.getState()
  const target = nextIndex(s.tourIndex, dir)
  if (target === s.tourIndex) return // at the first/last section: stay put
  useGame.getState().setTourIndex(target)
  audio.hover()
}

// From a guided section: step forward/backward, clamped at the ends (the CV
// opens and closes like a document). From free roam: resume from whichever
// constellation you're currently facing so the first wheel is never a mystery.
function nextIndex(tour: number, dir: 1 | -1) {
  if (tour >= 0) return Math.max(0, Math.min(TOUR.length - 1, tour + dir))
  const current = useGame.getState().currentZone as ZoneId | null
  const base = current ? TOUR.indexOf(current) : -1
  if (base < 0) return dir > 0 ? 0 : TOUR.length - 1
  return Math.max(0, Math.min(TOUR.length - 1, base + dir))
}

function normalizeWheel(e: WheelEvent) {
  let step = 1
  if (e.deltaMode === 1) step = 33 // lines -> px
  else if (e.deltaMode === 2) step = 400 // pages -> px
  return Math.max(-600, Math.min(600, e.deltaY * step))
}