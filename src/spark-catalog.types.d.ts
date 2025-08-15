// src/spark-catalog.types.d.ts
import type { Object3DNode } from '@react-three/fiber'
import type { WebGLRenderer } from 'three'
import type {
  SparkRenderer as SparkRendererClass,
  SplatMesh as SplatMeshClass,
} from '@sparkjsdev/spark'

export {}

declare module '@react-three/fiber' {
  interface ThreeElements {
    sparkRenderer: Object3DNode<SparkRendererClass, typeof SparkRendererClass> & {
      // you’ll pass constructor args via <sparkRenderer args={[{ renderer }]} />
      renderer?: WebGLRenderer // optional convenience prop if you map it yourself
    }
    splatMesh: Object3DNode<SplatMeshClass, typeof SplatMeshClass> & {
      url?: string
      index?: number
    }
  }
}
