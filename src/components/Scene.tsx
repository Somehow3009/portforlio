import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { WebGPURenderer } from 'three/webgpu'
import { Dome } from './world/Dome'
import { CameraRig } from './world/CameraRig'
import { Lights } from './world/Lights'
import { Stars } from './world/Stars'
import { Particles } from './world/Particles'
import { TourController } from './world/TourController'
import { LookController } from './world/LookController'
import { useGame } from '../store'

// R3F v9 can invoke the async gl factory twice if the owner re-renders while
// init() is still pending (pmndrs/react-three-fiber#3782), which would create a
// second WebGPURenderer on the same canvas and produce constant GPU validation
// errors from the orphan's stale 300x150 depth buffer. Share one renderer.
let rendererSingleton: Promise<WebGPURenderer> | null = null

export function Scene() {
  const setLoading = useGame((s) => s.setLoading)

  // Safety: never trap the user behind the loading screen if shaders stall.
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 6000)
    return () => window.clearTimeout(id)
  }, [setLoading])

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 62, near: 0.1, far: 600, position: [0, 0, 0.01] }}
        gl={(props) => {
          // WebGPU-first renderer (falls back to WebGL2 automatically).
          rendererSingleton ??= (async () => {
            const renderer = new WebGPURenderer(props as unknown as ConstructorParameters<typeof WebGPURenderer>[0])
            await renderer.init()
            return renderer
          })()
          return rendererSingleton
        }}
      >
        <color attach="background" args={['#02030a']} />
        <fog attach="fog" args={['#02030a', 120, 520]} />
        <Suspense fallback={null}>
          <Lights />
          <Stars />
          {/* the dome: camera sits at the centre, information is printed on
              the shell at fixed directions */}
          <Dome />
          <Particles />
          <LookController />
          <CameraRig />
          <TourController />
        </Suspense>
      </Canvas>
    </div>
  )
}