import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { useRef } from 'react'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
import { Cube } from './components/Cube'
import { Plane } from './components/Plane'
import { Sphere } from './components/Sphere'
import { LumaSplats } from './components/LumaSplat'
import { GlassGlobeWithLuma } from './components/GlassGlobe'

function Scene() {
  const { performance } = useControls('Monitoring', {
    performance: false,
  })

  const { size } = useControls('Cube', {
    size: 3,
  })

  return (
    <>
      {performance && <Perf position='top-left' />}

      <OrbitControls makeDefault />

      <GlassGlobeWithLuma
        innerGlobeRadius={size}
        lumaSource='https://lumalabs.ai/capture/2f4a6b64-f0bd-4e3e-a41a-c3aec8b96517'
      />
    </>
  )
}

export { Scene }
