export function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} color="#4455ff" />
      <hemisphereLight args={['#4a59ff', '#0a0d1f', 0.5]} />
      <directionalLight
        position={[30, 60, 20]}
        intensity={1.4}
        color="#cfe0ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[0, 25, 0]} intensity={40} distance={40} color="#00f0ff" />
      <pointLight position={[-38, 10, 8]} intensity={30} distance={30} color="#a855f7" />
      <pointLight position={[38, 10, 8]} intensity={30} distance={30} color="#39ff88" />
      <pointLight position={[0, 12, 40]} intensity={35} distance={35} color="#ffb020" />
    </>
  )
}
