import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { skills, projects, experiences, profile, zoneMeta } from '../../data'
import type { Skill, Project, Experience } from '../../data'
import { registerInteraction, type InteractionPoint } from '../interactions'
import { useGame, type ZoneId } from '../../store'
import { audio } from '../../audio'
import { SHELL_RADIUS } from './cameraShared'
import { VIEWPOINTS } from './LookController'

const ZONE_COLORS: Record<ZoneId, string> = {
  landing: '#ffd24a',
  skills: '#a855f7',
  projects: '#39ff88',
  career: '#ff2d95',
  hubs: '#00f0ff',
}

// ---------- shell helper: place points on a small disc of the dome ----------

function shellCluster(anchor: THREE.Vector3, n: number): THREE.Vector3[] {
  const a = anchor.clone().normalize()
  const t0 = Math.abs(a.y) < 0.92 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  const bit = new THREE.Vector3().crossVectors(a, t0).normalize()
  const tan = new THREE.Vector3().crossVectors(bit, a).normalize()
  const out: THREE.Vector3[] = []
  const spread = n > 5 ? 0.34 : 0.26
  for (let i = 0; i < n; i++) {
    const k = (i + 0.5) / n
    const r = spread * Math.sqrt(k)
    const th = i * 2.399963
    const dir = a
      .clone()
      .add(bit.clone().multiplyScalar(Math.sin(th) * r))
      .add(tan.clone().multiplyScalar(Math.cos(th) * r))
      .normalize()
    out.push(dir.multiplyScalar(SHELL_RADIUS))
  }
  return out
}

// ---------- data → constellation content ----------

type ShellItem =
  | { kind: 'skill'; skill: Skill }
  | { kind: 'project'; project: Project }
  | { kind: 'career'; exp: Experience }
  | { kind: 'terminal'; id: string; label: string; interactive?: boolean }

function constellationFor(zone: ZoneId): ShellItem[] {
  if (zone === 'skills') return skills.map((s) => ({ kind: 'skill' as const, skill: s }))
  if (zone === 'projects') return projects.map((p) => ({ kind: 'project' as const, project: p }))
  if (zone === 'career') return experiences.map((e) => ({ kind: 'career' as const, exp: e }))
  if (zone === 'hubs') {
    return [
      { kind: 'terminal' as const, id: 'terminal', label: 'OPEN CHANNEL' },
      { kind: 'terminal' as const, id: 'careers', label: 'CAREERS', interactive: false },
      { kind: 'terminal' as const, id: 'lab', label: 'CTF LAB', interactive: false },
    ]
  }
  // landing: profile nodes, decorative (one interactive greeting)
  return [
    { kind: 'terminal' as const, id: 'hello', label: `HELLO · I AM ${profile.name.toUpperCase()}`, interactive: true },
    { kind: 'terminal' as const, id: 'bio', label: 'Ω FULL-STACK / WEBGPU / AI', interactive: false },
    { kind: 'terminal' as const, id: 'edu', label: `🎓 ${profile.education}`, interactive: false },
    { kind: 'terminal' as const, id: 'loc', label: `⚲ ${profile.location.toUpperCase()}`, interactive: false },
  ]
}

function shellItemColor(item: ShellItem): string {
  if (item.kind === 'skill') return item.skill.color
  if (item.kind === 'project') return item.project.color
  if (item.kind === 'career') return item.exp.color
  return '#00f0ff'
}

// ---------- root Dome ----------

export function Dome() {
  const zones = useMemo<ZoneId[]>(() => ['landing', 'skills', 'projects', 'career', 'hubs'], [])

  return (
    <group>
      <Shell />
      <DustPoints />
      {zones.map((zone) => (
        <Constellation key={zone} zone={zone} />
      ))}
    </group>
  )
}

function Shell() {
  return (
    <group>
      {/* faint inner body so the void reads as a surface */}
      <mesh scale={SHELL_RADIUS * 0.97}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#061020" side={THREE.BackSide} transparent opacity={0.92} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ---------- one zone's information constellation ----------

function Constellation({ zone }: { zone: ZoneId }) {
  const color = ZONE_COLORS[zone]
  const anchor = VIEWPOINTS[zone]
  const items = useMemo<ShellItem[]>(() => constellationFor(zone), [zone])
  const positions = useMemo(() => shellCluster(anchor, items.length), [anchor, items.length])
  const zoneLabel = zoneMeta.find((z) => z.id === zone)?.label ?? zone.toUpperCase()

  const nodes = useMemo(() => {
    return items.map((item, i) => {
      const pos = positions[i].clone()
      const kind = item.kind === 'skill'
        ? ('skill' as const)
        : item.kind === 'project'
          ? ('project' as const)
          : item.kind === 'career'
            ? ('career' as const)
            : ('terminal' as const)
      const id = item.kind === 'skill' ? item.skill.id : item.kind === 'project' ? item.project.id : item.kind === 'career' ? item.exp.id : item.id
      const meta: InteractionPoint = {
        kind,
        id,
        position: pos,
        radius: 4,
        ...(item.kind === 'terminal' ? { label: item.label, interactive: item.interactive !== false } : {}),
        onInteract:
          item.kind === 'project'
            ? () => {
                audio.arrive()
                useGame.getState().setProjectDetail(item.project.id)
              }
            : item.kind === 'career'
              ? () => {
                  audio.arrive()
                  useGame.getState().setCareerDetail(item.exp.id)
                }
              : item.kind === 'terminal' && item.interactive !== false
                ? () => {
                    audio.uiClick()
                    useGame.getState().setContactOpen(true)
                  }
                : undefined,
      }
      const label =
        item.kind === 'skill'
          ? item.skill.name
          : item.kind === 'project'
            ? item.project.title
            : item.kind === 'career'
              ? item.exp.company
              : item.label ?? ''
      const detail =
        item.kind === 'skill'
          ? item.skill.tagline
          : item.kind === 'project'
            ? item.project.highlight
            : item.kind === 'career'
              ? `${item.exp.role} · ${item.exp.period}`
              : null
      return { meta, label, detail, color: shellItemColor(item), key: `${zone}-${id}` }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, positions])

  return (
    <group>
      {/* anchor gate on the shell */}
      <Gate position={anchor.clone().multiplyScalar(SHELL_RADIUS).toArray()} color={color} label={zoneLabel} />

      {/* nodes — the star system itself */}
      {nodes.map((n) => (
        <Node key={n.key} meta={n.meta} color={n.color} label={n.label} detail={n.detail} />
      ))}
    </group>
  )
}

// ---------- node on the shell ----------

// cached radial-glow texture (white, tinted per-material)
function radialTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}
const GLOW_TEX = radialTexture()

// Abstract "living constellation" planet: nested rotating wireframe
// polyhedra (different axes & speeds), orbiting electron dots, a breathing
// glow halo, tilted rings, and drifting dust cloud — pure 3D motion,
// no custom shaders required.
function PlanetVisual({ color, aimed, pulseKey }: { color: string; aimed: boolean; pulseKey: string }) {
  const glowRef = useRef<THREE.Mesh>(null)
  const shellARef = useRef<THREE.Mesh>(null)
  const shellBRef = useRef<THREE.Mesh>(null)
  const shellCRef = useRef<THREE.Mesh>(null)
  const e1Ref = useRef<THREE.Mesh>(null)
  const e2Ref = useRef<THREE.Mesh>(null)
  const e3Ref = useRef<THREE.Mesh>(null)
  const ringARef = useRef<THREE.Group>(null)
  const ringBRef = useRef<THREE.Group>(null)
  const cloudRef = useRef<THREE.Points>(null)

  const base = useMemo(() => {
    let h = 0
    for (let i = 0; i < pulseKey.length; i++) h = (h * 31 + pulseKey.charCodeAt(i)) % 997
    return h / 997
  }, [pulseKey])

  const colors = useMemo(() => {
    const c = new THREE.Color(color)
    const light = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.5)
    const dark = new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.35)
    return { c, light, dark }
  }, [color])

  const materials = useMemo(
    () => ({
      glow: new THREE.MeshBasicMaterial({ map: GLOW_TEX, color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
      shellA: new THREE.MeshBasicMaterial({ color: colors.c, wireframe: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }),
      shellB: new THREE.MeshBasicMaterial({ color: colors.light, wireframe: true, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
      shellC: new THREE.MeshBasicMaterial({ color: colors.dark, wireframe: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
      core: new THREE.MeshBasicMaterial({ color }),
      electron: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }),
      ring: new THREE.MeshBasicMaterial({ color: colors.light, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }),
    }),
    [color, colors],
  )

  const cloudGeo = useMemo(() => {
    const n = 10, pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 1.2 + Math.random() * 0.65, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      pos[i * 3 + 1] = r * Math.cos(ph)
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  const cloudMat = useMemo(
    () => new THREE.PointsMaterial({ color: colors.light, size: 0.06, transparent: true, opacity: 0.75, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    [colors],
  )

  useFrame((s, d) => {
    const t = s.clock.elapsedTime * 1.3 + base * Math.PI * 2
    const timeScale = aimed ? 1.35 : 1

    if (glowRef.current) {
      const pulse = 1 + Math.sin(t * 0.8) * 0.16 + (aimed ? 0.4 : 0)
      glowRef.current.scale.setScalar(pulse)
      const m = glowRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.38 + 0.1 * Math.sin(t * 0.9) + (aimed ? 0.32 : 0)
    }

    if (shellARef.current) { shellARef.current.rotation.x = t * 0.34 * timeScale; shellARef.current.rotation.z = t * 0.18 * timeScale }
    if (shellBRef.current) { shellBRef.current.rotation.y = -t * 0.28 * timeScale; shellBRef.current.rotation.x = t * 0.12 * timeScale }
    if (shellCRef.current) { shellCRef.current.rotation.z = t * 0.44 * timeScale; shellCRef.current.rotation.y = t * 0.15 * timeScale }

    const orb = (ref: React.RefObject<THREE.Mesh | null>, planeY: number, r: number, speed: number, offset: number) => {
      if (!ref.current) return
      const a = t * speed + offset
      ref.current.position.set(Math.cos(a) * r, Math.sin(a * 0.7) * planeY, Math.sin(a) * r)
    }
    orb(e1Ref, 0.25, 2.2, 1.35, 0)
    orb(e2Ref, 1.8, 2.0, 1.05, 2.1)
    orb(e3Ref, -0.9, 2.4, 0.85, 4.3)

    if (ringARef.current) { ringARef.current.rotation.z = t * 0.31; ringARef.current.rotation.x = 1.02 + Math.sin(t * 0.11) * 0.07 }
    if (ringBRef.current) { ringBRef.current.rotation.z = -t * 0.22; ringBRef.current.rotation.x = -1.22 + Math.sin(t * 0.09 + 2) * 0.06 }
    if (cloudRef.current) { cloudRef.current.rotation.y = t * 0.2; cloudRef.current.rotation.x = 0.65 + Math.sin(t * 0.22 + base * 6) * 0.25 }

    // scale outer children by aim (shell/particles)
    const targetShell = aimed ? 1.08 : 1
    if (shellARef.current) shellARef.current.scale.lerp(new THREE.Vector3(targetShell, targetShell, targetShell), Math.min(1, d * 6))
  })

  const r = (size: number, detail: number) => <icosahedronGeometry args={[size, detail]} />

return (
    <group scale={aimed ? 1.9 : 1.6}>
      {/* glow halo */}
      <mesh ref={glowRef} scale={5.2}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.glow} attach="material" />
      </mesh>

      {/* electron dust cloud */}
      <group ref={cloudRef} rotation-x={0.65}>
        <points geometry={cloudGeo} frustumCulled={false}>
          <primitive object={cloudMat} attach="material" />
        </points>
      </group>

      {/* nested rotating wireframe shells (low-poly for performance) */}
      <mesh ref={shellARef} scale={1.5}>{r(1.5, 0)}<primitive object={materials.shellA} attach="material" /></mesh>
      <mesh ref={shellBRef} scale={1.3}>{r(1.3, 1)}<primitive object={materials.shellB} attach="material" /></mesh>
      <mesh ref={shellCRef} scale={1.05}>{r(1.08, 0)}<primitive object={materials.shellC} attach="material" /></mesh>

      {/* orbiting electron dots */}
      <mesh ref={e1Ref}><sphereGeometry args={[0.12, 8, 8]} /><primitive object={materials.electron} attach="material" /></mesh>
      <mesh ref={e2Ref}><sphereGeometry args={[0.1, 8, 8]} /><primitive object={materials.electron} attach="material" /></mesh>
      <mesh ref={e3Ref}><sphereGeometry args={[0.11, 8, 8]} /><primitive object={materials.electron} attach="material" /></mesh>

      {/* counter-tilting ring system */}
      <group ref={ringARef} rotation-x={1.02}>
        <mesh rotation-z={0.3}><torusGeometry args={[2.4, 0.04, 6, 38]} /><primitive object={materials.ring} attach="material" /></mesh>
        <mesh rotation-z={-0.9} scale={0.82}><torusGeometry args={[2.4, 0.022, 6, 30]} /><primitive object={materials.ring} attach="material" /></mesh>
      </group>
      <group ref={ringBRef} rotation-x={-1.22}>
        <mesh rotation-z={0.15}><torusGeometry args={[2.0, 0.03, 6, 32]} /><primitive object={materials.ring} attach="material" /></mesh>
      </group>

      {/* dense core */}
      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <primitive object={materials.core} attach="material" />
      </mesh>

      {/* sunlit highlight */}
      <mesh position={[0.22, 0.32, 0.68]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <primitive object={materials.electron} attach="material" />
      </mesh>
    </group>
  )
}

function Node({
  meta,
  color,
  label,
  detail,
}: {
  meta: InteractionPoint
  color: string
  label: string
  detail: string | null
}) {
  const active = useGame((s) => s.activeInteraction)
  const aimed = active?.id === meta.id && (active.type === meta.kind || meta.kind === 'terminal')
  const pos = meta.position
  const actionable = meta.interactive !== false && !!meta.onInteract

  useEffect(() => {
    const unreg = registerInteraction(meta)
    return unreg
  }, [meta])

  return (
    <group
      position={[pos.x, pos.y, pos.z]}
      onUpdate={(self) => {
        // face the camera at the centre of the dome
        self.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().multiplyScalar(-1).normalize())
      }}
    >
      {/* planet — glow, core, orbiting rings */}
      <PlanetVisual color={color} aimed={aimed} pulseKey={meta.id} />
      <Html center distanceFactor={13} zIndexRange={[10, 0]}>
        <div
          data-ui
          onClick={actionable ? () => meta.onInteract?.() : undefined}
          className="relative px-2.5 py-1 rounded font-mono text-[15px] font-semibold tracking-wider whitespace-nowrap select-none"
          style={{
            color: aimed ? '#ffffff' : '#dce7ff',
            textShadow: aimed ? `0 0 14px ${color}, 0 0 28px ${color}44` : `0 0 6px ${color}55`,
            background: aimed ? 'rgba(6,10,22,0.94)' : 'rgba(5,8,20,0.66)',
            border: aimed ? `1.5px solid ${color}` : '1px solid rgba(150,170,210,0.35)',
            backdropFilter: aimed ? 'blur(4px)' : undefined,
            cursor: actionable ? 'pointer' : 'default',
            transition: 'transform 150ms ease, background 120ms ease, box-shadow 150ms ease',
            transform: aimed ? 'scale(1.06)' : undefined,
            boxShadow: aimed ? `0 0 24px ${color}33` : undefined,
          }}
        >
          {label}
          {aimed && actionable && (
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded font-mono text-[9px] tracking-widest whitespace-nowrap animate-glowpulse"
              style={{
                color: '#0a0d1a',
                background: color,
              }}
            >
              E · CLICK
            </span>
          )}
          {aimed && detail && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded font-mono text-[13px] leading-snug text-center cursor-default"
              style={{
                color: '#fff',
                background: 'rgba(5,8,20,0.92)',
                backdropFilter: 'blur(6px)',
                border: `1px solid ${color}88`,
                boxShadow: `0 0 18px ${color}22`,
                textShadow: `0 0 8px ${color}`,
                maxWidth: 420,
                pointerEvents: 'none',
              }}
            >
              {detail}
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}

// ---------- zone gate: big glowing ring orienting the visitor ----------

function Gate({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  const p = useMemo(() => new THREE.Vector3(...position), [position])
  return (
    <group position={position}>
      <mesh onUpdate={(self) => self.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().multiplyScalar(-1).normalize())}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial map={GLOW_TEX} color={color} transparent opacity={0.34} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh onUpdate={(self) => self.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().multiplyScalar(-1).normalize())}>
        <torusGeometry args={[2.2, 0.06, 10, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
      <Html center distanceFactor={22} zIndexRange={[5, 0]}>
        <div
          className="font-display tracking-[0.3em] whitespace-nowrap text-[18px] font-bold select-none"
          style={{ color, textShadow: `0 0 20px ${color}, 0 0 40px ${color}55` }}
        >
          {label}
        </div>
      </Html>
    </group>
  )
}

// ---------- slowly drifting motes inside the dome ----------

const DUST_COUNT = 850

function DustPoints() {
  const ref = useRef<THREE.Points>(null)
  const { positions } = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3)
    for (let i = 0; i < DUST_COUNT; i++) {
      // uniform in the shell volume
      const u = Math.random()
      const r = Math.cbrt(u) * SHELL_RADIUS * 0.92
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th)
      positions[i * 3 + 1] = r * Math.cos(ph)
      positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    }
    return { positions }
  }, [])

  useFrame((_, delta) => {
    if (!ref.current) return
    const pts = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = pts.array as Float32Array
    const t = delta * 0.05
    for (let i = 0; i < DUST_COUNT; i++) {
      const x = arr[i * 3]
      const y = arr[i * 3 + 1]
      const z = arr[i * 3 + 2]
      // gentle drift + twinkle handled by material opacity via size
      const y2 = y * Math.cos(t) - x * Math.sin(t)
      const x2 = y * Math.sin(t) + x * Math.cos(t)
      if (x2 * x2 + y2 * y2 + z * z > SHELL_RADIUS * SHELL_RADIUS) continue
      arr[i * 3] = x2
      arr[i * 3 + 1] = y2
      arr[i * 3 + 2] = z
    }
    pts.needsUpdate = true
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#9fd8ff"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}