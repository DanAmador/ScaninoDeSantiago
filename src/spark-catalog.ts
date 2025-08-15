// src/spark-catalog.ts
import { extend } from '@react-three/fiber'
import {
  SparkRenderer as SparkRendererClass,
  SplatMesh as SplatMeshClass,
} from '@sparkjsdev/spark'

extend({ SparkRenderer: SparkRendererClass, SplatMesh: SplatMeshClass })
