import * as THREE from 'three'

export type InteractionKind = 'skill' | 'project' | 'career' | 'terminal'

export interface InteractionPoint {
  kind: InteractionKind
  id: string
  position: THREE.Vector3
  radius: number
  interactive?: boolean // false = display-only ornament
  label?: string // reticle text override
  onEnter?: () => void
  onExit?: () => void
  onInteract?: () => void
}

// Shared mutable registry so the character controller can check proximity.
const registry: InteractionPoint[] = []

export function registerInteraction(p: InteractionPoint) {
  registry.push(p)
  return () => {
    const i = registry.indexOf(p)
    if (i >= 0) registry.splice(i, 1)
  }
}

export function getNearbyInteraction(
  pos: THREE.Vector3,
): InteractionPoint | null {
  let best: InteractionPoint | null = null
  let bestDist = Infinity
  for (const p of registry) {
    const d = pos.distanceTo(p.position)
    if (d < p.radius && d < bestDist) {
      best = p
      bestDist = d
    }
  }
  return best
}

export function getDistance(pos: THREE.Vector3, id: string): number | null {
  const p = registry.find((x) => x.id === id)
  return p ? pos.distanceTo(p.position) : null
}

export interface GazeResult {
  point: InteractionPoint
  distance: number
  angle: number
}

// First-person "gaze" selection: pick the interaction node closest to the
// view axis AND within range. Returns null when nothing is aimed at.
export function getGazeInteraction(
  eye: THREE.Vector3,
  viewDir: { x: number; y: number; z: number },
  maxDistance = 80,
  maxAngle = 0.42, // cone around the view axis (radians)
): GazeResult | null {
  let best: GazeResult | null = null
  const dvec = new THREE.Vector3()
  for (const p of registry) {
    if (p.interactive === false) continue
    dvec.copy(p.position).sub(eye)
    const dist = dvec.length()
    if (dist > maxDistance) continue
    if (dist < 0.001) continue
    dvec.normalize()
    const angle = Math.acos(Math.min(1, Math.max(-1, dvec.x * viewDir.x + dvec.y * viewDir.y + dvec.z * viewDir.z)))
    if (angle > maxAngle) continue
    if (!best || angle < best.angle) {
      best = { point: p, distance: dist, angle }
    }
  }
  return best
}

export function debugRegistry() {
  return registry.map((p) => ({
    kind: p.kind,
    id: p.id,
    radius: p.radius,
    pos: { x: p.position.x, y: p.position.y, z: p.position.z },
  }))
}
