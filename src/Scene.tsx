// Scene.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { CameraControls } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import type { SplatMesh as SparkSplatMesh } from '@sparkjsdev/spark'

// spark-catalog.ts
import { extend, ReactThreeFiber } from '@react-three/fiber'
import type * as THREE from 'three'
import {
  SparkRenderer as SparkRendererClass,
  SplatLoader,
  SplatMesh,
  SplatMesh as SplatMeshClass,
} from '@sparkjsdev/spark'
import { Cube } from './components/Cube'

// 1) Register Spark classes in R3F's JSX catalog
extend({ SparkRenderer: SparkRendererClass, SplatMesh: SplatMeshClass })

// 2) Tell TypeScript about the new intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      sparkRenderer: ReactThreeFiber.Object3DNode<
        SparkRendererClass,
        typeof SparkRendererClass
      > & { renderer?: THREE.WebGLRenderer } // convenience prop if you don't use args

      splatMesh: ReactThreeFiber.Object3DNode<SplatMeshClass, typeof SplatMeshClass> & {
        url?: string
        index?: number
      }
    }
  }
}
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

export function Scene() {
  const meshRef = useRef<any>(null)
  const renderer = useThree((state) => state.gl)
  const sparkRendererArgs = useMemo(() => {
    return { renderer }
  }, [renderer])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.5 * delta
    }
  })

  return (
    <>
      <CameraControls />
      <sparkRenderer args={[sparkRendererArgs]}>
        <group>
          <splatMesh
            ref={meshRef}
            url='https://sparkjs.dev/assets/splats/butterfly.spz'
          />
        </group>
      </sparkRenderer>
    </>
  )
}
