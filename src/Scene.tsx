// Scene.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import type { SplatMesh as SparkSplatMesh } from '@sparkjsdev/spark'

// spark-catalog.ts
import { extend, ReactThreeFiber } from '@react-three/fiber'
import {
  SparkRenderer as SparkRendererClass,
  SplatLoader,
  SplatMesh,
  SplatMesh as SplatMeshClass,
} from '@sparkjsdev/spark'
import { Cube } from './components/Cube'
import { WebGLRenderer } from 'three'

type SplatLocation = {
  name: string
  latitude: number
  longitude: number
  isVisible: boolean
}

export type ParsedSplat = {
  name: string
  date: string
  location: SplatLocation
  localUrl: string
}

function useParsedSplats(): ParsedSplat[] {
  const [splats, setSplats] = useState<ParsedSplat[]>([])
  useEffect(() => {
    fetch('/parsed_splats.json')
      .then((r) => r.json())
      .then(setSplats)
  }, [])
  return splats
}
// ensure this import runs once somewhere before render
import './spark-catalog'

export function Scene() {
  const gl = useThree((s) => s.gl)
  const sparkArgs = useMemo(() => [{ renderer: gl }], [gl])

  const splats = useParsedSplats()

  return (
    <>
      <CameraControls />
      <sparkRenderer args={sparkArgs}>
        <group>
          {splats
            .filter((s) => s.location?.isVisible !== false)
            .map((s, i) => {
              // stagger a little so you can see multiple splats
              const x = (i % 5) * 1.5
              const z = -3 - Math.floor(i / 5) * 2
              console.log(s.localUrl)
              return (
                <splatMesh
                  key={s.name ?? s.localUrl ?? i}
                  args={[{ url: s.localUrl }]} // <- important: constructor args
                  quaternion={[1, 0, 0, 0]} // typical Spark orientation
                  position={[x, 0, z]}
                />
              )
            })}
        </group>
      </sparkRenderer>
    </>
  )
}
