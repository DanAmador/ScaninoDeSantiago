import { AdaptiveDpr, Environment, OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { useState } from 'react'
import { GlassGlobeWithLuma } from './components/GlassGlobe'
import { LumaSplats } from './components/LumaSplat'

function Scene() {
  const { performance } = useControls('Monitoring', {
    performance: false,
  })

  const { size } = useControls('Cube', {
    size: 3,
  })

  // Array of Luma source URLs
  const lumaSources = [
    '2f4a6b64-f0bd-4e3e-a41a-c3aec8b96517',
    'af89ef4a-fe34-4d98-aaf8-c8add083a835',
  ]

  // State to track the current index of the Luma source
  const [currentIndex, setCurrentIndex] = useState(0)

  // Control to cycle through the Luma sources
  const { nextLumaSource } = useControls('Luma Control', {
    nextLumaSource: {
      value: false,
      onChange: () => setCurrentIndex((currentIndex + 1) % lumaSources.length),
    },
  })

  return (
    <>
      {performance && <Perf position='top-left' />}
      <AdaptiveDpr pixelated />
      <OrbitControls makeDefault />
      <LumaSplats source='https://lumalabs.ai/capture/2f4a6b64-f0bd-4e3e-a41a-c3aec8b96517' />
      <GlassGlobeWithLuma
        innerGlobeRadius={size}
        lumaSource={`https://lumalabs.ai/capture/${lumaSources[currentIndex]}`}
      />
    </>
  )
}

export { Scene }
