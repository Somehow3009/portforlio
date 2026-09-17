import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../../store'
import { heading, pitch, lookMotion, zoom, ZOOM_MIN } from './cameraShared'

const FOV = 62
const FOV_KICK = 8
const ROLL_GAIN = 0.05
const ROLL_DAMP = 6
const INTRO_DURATION = 2.4
const AIM_PULL = 16 // FOV pulled in while gazing at a node, for readability
const AIM_PULL_LAMBDA = 2.6

const _q = new THREE.Quaternion()
const _rollQ = new THREE.Quaternion()
const _fwd = new THREE.Vector3()

const devFov = { current: FOV, frames: 0 }

// Camera sits at the very centre of the dome and rotates like a head.
export function CameraRig() {
  const phase = useGame((s) => s.phase)
  const tourIndex = useGame((s) => s.tourIndex)
  const activeInteraction = useGame((s) => s.activeInteraction)
  const roll = useRef(0)
  const fov = useRef(FOV)
  const t = useRef(0)
  const fovSettledOnce = useRef(false)
  const aimPull = useRef(0)

  useFrame(({ camera: baseCamera }, delta) => {
    devFov.frames++
    const camera = baseCamera as THREE.PerspectiveCamera
    const dt = Math.min(delta, 0.05)
    t.current += dt

    // orientation from yaw + pitch (YXZ applies yaw around world Y)
    _q.setFromEuler(new THREE.Euler(pitch.current, heading.current, 0, 'YXZ'))

    // directional roll while the head turns, eased back when still
    const yawSpeed = lookMotion.yawSpeed
    const targetRoll = -clamp(yawSpeed * ROLL_GAIN, -0.08, 0.08)
    roll.current += (targetRoll - roll.current) * (1 - Math.exp(-ROLL_DAMP * dt))
    if (Math.abs(roll.current) > 0.001) {
      // roll about the current view axis
      _fwd.set(
        -Math.sin(heading.current) * Math.cos(pitch.current),
        Math.sin(pitch.current),
        -Math.cos(heading.current) * Math.cos(pitch.current),
      ).normalize()
      _rollQ.setFromAxisAngle(_fwd, roll.current)
      _q.premultiply(_rollQ)
    }
    camera.quaternion.copy(_q)

    // FOV: enter the dome from a wide start, then follow the scroll-zoom rest
    // value, kicking outward briefly when sweeping fast. While gazing at a node
    // (free roam only) gently pull inward so the printed info reads bigger.
    const targetPull = activeInteraction && tourIndex < 0 && fovSettledOnce.current ? AIM_PULL : 0
    aimPull.current += (targetPull - aimPull.current) * (1 - Math.exp(-AIM_PULL_LAMBDA * dt))

    let baseFov = zoom.current
    if (phase !== 'playing' || !fovSettledOnce.current) {
      const k = Math.min(1, t.current / INTRO_DURATION)
      baseFov = 110 + (zoom.current - 110) * (1 - Math.pow(1 - k, 3))
      if (k >= 1 && phase === 'playing') fovSettledOnce.current = true
    } else if (Math.abs(yawSpeed) > 0.4) {
      baseFov = zoom.current + FOV_KICK * Math.min(1, Math.abs(yawSpeed) / 2)
    }
    const targetFov = Math.max(ZOOM_MIN, baseFov - aimPull.current)
    fov.current += (targetFov - fov.current) * (1 - Math.exp(-6 * dt))
    devFov.current = fov.current
    if (Math.abs(camera.fov - fov.current) > 0.01) {
      camera.fov = fov.current
      camera.updateProjectionMatrix()
    }
  })

  // Expose the easing FOV to dev tooling / smoke tests. Getters are added to
  // the shared __universe with defineProperty so they are never flattened into
  // stale snapshots by an object spread elsewhere.
  useEffect(() => {
    const u = (window as unknown as Record<string, unknown>).__universe as Record<string, unknown> | undefined
    if (!u) return
    Object.defineProperty(u, 'fov', {
      configurable: true,
      get() {
        return devFov.current
      },
    })
    Object.defineProperty(u, 'crFrames', {
      configurable: true,
      get() {
        return devFov.frames
      },
    })
  }, [])

  return null
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}