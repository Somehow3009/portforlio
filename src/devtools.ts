// Single writer for the window.__universe debug shim used by smoke tests and
// consoles. It is created exactly once and its getters are never re-spread,
// so values stay live (spreading getters into a fresh object flattens them
// into frozen snapshots, which made early probes read stale state).
import * as THREE from 'three'
import { useGame } from './store'
import type { ZoneId } from './store'
import { inputState } from './components/controls'
import {
  heading as headingState,
  pitch as pitchState,
  setHeading,
  setPitch,
  lookMotion,
  SHELL_RADIUS,
} from './components/world/cameraShared'
import { debugRegistry } from './components/interactions'

const VIEWPOINT_DIR: Record<ZoneId, [number, number, number]> = {
  landing: [0, 0.28, 1],
  skills: [-1.05, 0.75, 0.1],
  projects: [1.05, 0.35, 0.1],
  career: [0.6, -0.55, -0.75],
  hubs: [0.15, 0.55, -1],
}

export function installDevtools() {
  const w = window as unknown as Record<string, unknown>
  if (w.__universe) return
  w.__universe = {
    useGame,
    debugRegistry,
    radius: SHELL_RADIUS,
    get input() {
      return inputState
    },
    get view() {
      return { yaw: headingState.current, pitch: pitchState.current }
    },
    get omega() {
      return lookMotion.yawSpeed
    },
    get aim() {
      return useGame.getState().activeInteraction
    },
    get tourIndex() {
      return useGame.getState().tourIndex
    },
    heading: () => headingState.current,
    pitch: () => pitchState.current,
    setView: (yaw: number, pitch: number) => {
      setHeading(yaw)
      setPitch(pitch)
    },
    faceZone: (zone: string) => {
      const dir = VIEWPOINT_DIR[zone as ZoneId]
      if (!dir) return
      const v = new THREE.Vector3(...dir).normalize()
      setHeading(Math.atan2(-v.x, -v.z))
      setPitch(Math.asin(Math.max(-1, Math.min(1, v.y))))
    },
  }
}