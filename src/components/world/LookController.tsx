import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { inputState } from '../controls'
import { useGame, TOUR } from '../../store'
import type { ZoneId } from '../../store'
import {
  heading as headingState,
  pitch as pitchState,
  setHeading,
  setPitch,
  viewDir,
  SHELL_RADIUS,
  PITCH_MIN,
  PITCH_MAX,
  lookMotion,
  flow,
  FLOW_SETTLE,
} from './cameraShared'
import { audio } from '../../audio'
import { getGazeInteraction } from '../interactions'

const TURN_RATE = 1.1 // rad/s at full stick
const PITCH_RATE = 0.8 // rad/s look up/down
const LOOK_ATTACH = 14 // how quickly the head snaps to target velocity
const MAX_OMEGA = 3.2
const TURN_DAMP = 4.5 // section swing easing (lambda) — slow & silky
const PITCH_DAMP = 5
const GAZE_ANGLE = 0.42

// Each zone lives at a fixed direction on the dome. Looking "straight at" a
// zone reveals its constellation of information printed on the shell.
const VIEWPOINTS: Record<ZoneId, THREE.Vector3> = {
  landing: new THREE.Vector3(0, 0.28, 1).normalize(),
  skills: new THREE.Vector3(-1.05, 0.75, 0.1).normalize(),
  projects: new THREE.Vector3(1.05, 0.35, 0.1).normalize(),
  career: new THREE.Vector3(0.6, -0.55, -0.75).normalize(),
  hubs: new THREE.Vector3(0.15, 0.55, -1).normalize(),
}

const _dir = new THREE.Vector3()

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  let diff = target - current
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * (1 - Math.exp(-lambda * delta))
}

function toYaw(dir: THREE.Vector3) {
  return Math.atan2(-dir.x, -dir.z)
}

function toPitch(dir: THREE.Vector3) {
  return Math.asin(Math.max(-1, Math.min(1, dir.y)))
}

// Which zone is your view aimed at?
function zoneForView() {
  let best: ZoneId | null = null
  let bestDot = -1
  viewDir(_dir, headingState.current, pitchState.current)
  for (const z of TOUR) {
    const d = VIEWPOINTS[z].dot(_dir)
    if (d > bestDot) {
      bestDot = d
      best = z
    }
  }
  return bestDot > 0.55 ? best : null
}

export function LookController() {
  const setStarted = useGame((s) => s.setStarted)
  const setControlsEnabled = useGame((s) => s.setControlsEnabled)
  const tourIndex = useGame((s) => s.tourIndex)
  const setZone = useGame((s) => s.setZone)
  const setInteraction = useGame((s) => s.setInteraction)
  const triggerBurst = useGame((s) => s.triggerBurst)

  const yawOmega = useRef(0)
  const pitchVel = useRef(0)
  const prevHeading = useRef(headingState.current)
  const lastInteraction = useRef<string | null>(null)
  const lastZone = useRef<ZoneId | null>(null)

  useEffect(() => {
    setControlsEnabled(true)
  }, [setControlsEnabled])

  useEffect(() => {
    if (tourIndex < 0) {
      yawOmega.current = 0
      pitchVel.current = 0
    }
  }, [tourIndex])

  const eye = useRef(new THREE.Vector3())
  const gaze = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    // Read the live store every frame so a stale closure can never freeze
    // manual look / tour hand-off (R3F + zustand subscription pitfall).
    const g = useGame.getState()
    if (g.phase !== 'playing' || !g.controlsEnabled) {
      return
    }
    const tourIndex = g.tourIndex
    const dt = Math.min(delta, 0.05)

    if (tourIndex >= 0) {
      // section: ease the whole head toward the next constellation with sound
      const zone = TOUR[tourIndex]
      const targetDir = VIEWPOINTS[zone]
      const tYaw = toYaw(targetDir)
      const tPitch = toPitch(targetDir)
      const hPrev = prevHeading.current
      const h = dampAngle(headingState.current, tYaw, TURN_DAMP, dt)
      const p = pitchState.current + (tPitch - pitchState.current) * (1 - Math.exp(-PITCH_DAMP * dt))
      setHeading(h)
      setPitch(p)
      yawOmega.current = 0
      pitchVel.current = 0
      // feed the eased swing's instantaneous speed to CameraRig so the head
      // banks gently through the arc instead of snapping the roll off
      let hd = h - hPrev
      while (hd > Math.PI) hd -= Math.PI * 2
      while (hd < -Math.PI) hd += Math.PI * 2
      lookMotion.yawSpeed = Math.max(-3, Math.min(3, hd / dt))
      lookMotion.pitchSpeed = 0
      prevHeading.current = h
      // swing lock: while still easing, wheel steps are buffered not dropped
      let dY = tYaw - headingState.current
      while (dY > Math.PI) dY -= Math.PI * 2
      while (dY < -Math.PI) dY += Math.PI * 2
      flow.locked = Math.hypot(dY, pitchState.current - tPitch) > FLOW_SETTLE
    } else {
      flow.locked = false
      prevHeading.current = headingState.current
      // manual look: velocity model with inertia, like a head turning
      const targetOmega = inputState.x * TURN_RATE + inputState.lookVel
      yawOmega.current += (targetOmega - yawOmega.current) * (1 - Math.exp(-LOOK_ATTACH * dt))
      yawOmega.current = Math.max(-MAX_OMEGA, Math.min(MAX_OMEGA, yawOmega.current))
      const targetPitchVel = -inputState.z * PITCH_RATE + inputState.pitchVel
      pitchVel.current += (targetPitchVel - pitchVel.current) * (1 - Math.exp(-LOOK_ATTACH * dt))
      // yaw: invert so drag/A-D right turns the view right, left turns left
      setHeading(headingState.current - yawOmega.current * dt)
      const np = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitchState.current + pitchVel.current * dt))
      setPitch(np)
      lookMotion.yawSpeed = yawOmega.current
      lookMotion.pitchSpeed = pitchVel.current
    }

    // which constellation you're aimed at
    const zone = zoneForView()
    if (zone !== lastZone.current) {
      lastZone.current = zone
      if (zone) {
        setZone(zone)
        setStarted(true)
      }
    }

    // gaze selection on the shell
    viewDir(gaze.current, headingState.current, pitchState.current)
    eye.current.set(0, 0, 0)
    const hit = getGazeInteraction(eye.current, gaze.current)
    if (hit) {
      const kind = hit.point.kind
      setInteraction({ type: kind, id: hit.point.id })
      if (lastInteraction.current !== hit.point.id) {
        triggerBurst([hit.point.position.x, hit.point.position.y, hit.point.position.z], burstColor(kind))
        audio.activate()
      }
      lastInteraction.current = hit.point.id
      if (inputState.interact && hit.point.onInteract) {
        hit.point.onInteract()
        inputState.interact = false
      }
    } else {
      setInteraction(null)
      lastInteraction.current = null
    }
  })

  // Expose navigation state to dev tooling / smoke tests. These are set via
  // devtools.ts (src/devtools.ts), which centralises the window.__universe
  // debug shim exactly once. Spreading then re-spreading getters across
  // components flattens them into frozen values, so do not duplicate the
  // expose here.
  return null
}

export { VIEWPOINTS, SHELL_RADIUS, GAZE_ANGLE }

function burstColor(kind: 'skill' | 'project' | 'career' | 'terminal') {
  if (kind === 'skill') return '#a855f7'
  if (kind === 'project') return '#39ff88'
  if (kind === 'career') return '#ff2d95'
  return '#00f0ff'
}