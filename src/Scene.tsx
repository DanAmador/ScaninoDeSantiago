// Scene.tsx
import { useMemo } from 'react'
import { CameraControls, Html, Sphere } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

import './spark-catalog'
import { ParsedSplat, useParsedSplats, useSplatCycler } from './useSplatCycler'
import { useSplatControls } from './useSplatMetadataControls'
import { SparkSplat } from './components/SparkSplat'
import useSplatData from './useSplatData'

export function Scene() {
  const gl = useThree((s) => s.gl)
  const sparkArgs = useMemo(() => [{ renderer: gl }], [gl])

  const splats = useParsedSplats()
  const { current, index, count } = useSplatCycler(splats)
  const { updateSplat } = useSplatData()
  useSplatControls(current, (updatedSplat) => {
    updateSplat(updatedSplat as any)
  })
  return (
    <>
      <CameraControls />
      <sparkRenderer args={sparkArgs}>
        <Sphere></Sphere>
        <group>{current && <SparkSplat splat={current} />}</group>
      </sparkRenderer>

      {/* tiny HUD */}
      <Html position={[0, 1.5, -2.5]}>
        <div
          style={{
            padding: 8,
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            borderRadius: 8,
          }}
        >
          {count
            ? `Splat ${index + 1}/${count} — press Enter for next, Backspace for previous`
            : 'Loading…'}
        </div>
      </Html>
    </>
  )
}
