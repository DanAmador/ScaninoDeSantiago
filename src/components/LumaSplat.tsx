// LumaSplats.tsx
import { Object3DNode, extend } from '@react-three/fiber'
import { LumaSplatsSemantics, LumaSplatsThree } from '@lumaai/luma-web'
import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { CubeTexture } from 'three'

// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree })

// For TypeScript support
declare module '@react-three/fiber' {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
  }
}

interface LumaSplatsProps {
  position?: [number, number, number]
  scale?: [number, number, number]
  rotation?: [number, number, number]
  source: string
}

export function LumaSplats({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  source,
}: LumaSplatsProps) {
  const { scene, gl } = useThree()
  const lumaSplatRef = useRef<LumaSplatsThree>(new LumaSplatsThree())

  const [splatWorld, setPlatWorld] = useState<CubeTexture>()

  // useEffect(() => {
  //   if (lumaSplatRef.current) {
  //     scene.environment = null
  //     scene.background = null
  //     // // You can enable this if you need to capture the cubemap:
  //     void lumaSplatRef.current.captureCubemap(gl).then((cubemap) => {
  //       lumaSplatRef.current.material.transparent = false
  //     })

  //     // capture environment lighting after load
  //     lumaSplatRef.current.onLoad = () => {
  //       lumaSplatRef.current.captureCubemap(gl).then((cubemap) => {
  //         setPlatWorld(cubemap)
  //       })
  //     }
  //   }
  // }, [gl, scene])

  // useEffect(() => {
  //   if (!splatWorld) return
  //   const { environmentMap } = lumaSplatRef?.current
  //   if (scene.environment != environmentMap) {
  //     scene.environment = environmentMap
  //     scene.background = environmentMap
  //   }
  // }, [splatWorld])
  return (
    <>
      <lumaSplats
        // semanticsMask={LumaSplatsSemantics.FOREGROUND}
        ref={lumaSplatRef}
        position={position}
        scale={scale}
        rotation={rotation}
        source={source}
      />
    </>
  )
}
