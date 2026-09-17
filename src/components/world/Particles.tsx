import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../../store'

// One-shot particle bursts on the dome when an information node is focused.
export function Particles() {
  const burst = useGame((s) => s.burst)
  const clearBurst = useGame((s) => s.clearBurst)

  // Auto-clear burst fx shortly after it fires.
  useEffect(() => {
    if (!burst) return
    const id = window.setTimeout(() => clearBurst(), 900)
    return () => window.clearTimeout(id)
  }, [burst, clearBurst])

  return <BurstFX burst={burst} />
}

function BurstFX({ burst }: { burst: { at: [number, number, number]; color: string; time: number } | null }) {
  const ref = useRef<THREE.Points>(null)
  const lastTime = useRef(0)
  const seed = useMemo(() => {
    const positions = new Float32Array(90 * 3)
    const velocities: THREE.Vector3[] = []
    for (let i = 0; i < 90; i++) {
      velocities.push(new THREE.Vector3())
    }
    return { positions, velocities }
  }, [])

  // Reseed on every distinct burst so the pop always looks fresh.
  useEffect(() => {
    if (!burst || burst.time === lastTime.current) return
    lastTime.current = burst.time
    for (let i = 0; i < 90; i++) {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize()
      seed.velocities[i].copy(dir.multiplyScalar(2 + Math.random() * 5))
    }
  }, [burst, seed.velocities])

  useFrame((_, delta) => {
    if (!ref.current || !burst) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < 90; i++) {
      pos[i * 3] = burst.at[0] + seed.velocities[i].x
      pos[i * 3 + 1] = burst.at[1] + seed.velocities[i].y
      pos[i * 3 + 2] = burst.at[2] + seed.velocities[i].z
      seed.velocities[i].multiplyScalar(1 - delta * 2.5)
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  if (!burst) return null
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[seed.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        color={burst.color}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}