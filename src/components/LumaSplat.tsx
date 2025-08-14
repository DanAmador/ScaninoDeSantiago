import React, { forwardRef, useEffect, useRef } from "react";
import { SplatMesh } from "@sparkjsdev/spark";
import { useFrame } from "@react-three/fiber";
import { SplatDataset } from "../useSplatData";
import { Matrix4, Vector3, Mesh } from "three";
import * as THREE from "three";

export const CustomSplat = forwardRef<SplatMesh, { splat: SplatDataset }>(({ splat }, ref) => {
  const localSplatRef = useRef<SplatMesh | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const clipRadiusUniform = useRef({ value: splat.scale ?? 1 });
  const inverseGlobeUniform = useRef({ value: new Matrix4() });
  const offsetUniform = useRef({ value: new Vector3() });

  useEffect(() => {
    if (localSplatRef.current) {
      // Apply initial transformations
      const splatMesh = localSplatRef.current;
      if (splat.offset) {
        splatMesh.position.set(...splat.offset);
      }
      if (splat.scale) {
        splatMesh.scale.setScalar(splat.scale);
      }
    }
  }, [splat.offset, splat.scale]);

  useEffect(() => {
    // Create and load the splat mesh
    const splatMesh = new SplatMesh({
      url: splat.url
    });
    
    if (groupRef.current) {
      groupRef.current.add(splatMesh);
      localSplatRef.current = splatMesh;
      
      // Forward the ref if provided
      if (typeof ref === 'function') {
        ref(splatMesh);
      } else if (ref) {
        (ref as any).current = splatMesh;
      }
      
      // Apply initial transformations
      if (splat.offset) {
        splatMesh.position.set(...splat.offset);
      }
      if (splat.scale) {
        splatMesh.scale.setScalar(splat.scale);
      }
    }

    return () => {
      if (groupRef.current && splatMesh) {
        groupRef.current.remove(splatMesh);
      }
    };
  }, [splat.url, splat.offset, splat.scale, ref]);

  // Update uniforms whenever clip parameters change
  useEffect(() => {
    if (localSplatRef.current && localSplatRef.current.parent) {
      const { center, radius } = splat.clip ?? { center: [0, 0, 0], radius: 1 };
      const { offset } = splat;
      if (offset) offsetUniform.current.value.set(...offset);
      if (splat.ratio) clipRadiusUniform.current.value = splat.ratio / splat.scale; // Update clip radius
      console.log(clipRadiusUniform.current.value)
    }
  }, [splat.ratio, localSplatRef.current, splat.clip?.radius]);

  // Update the globe's inverse matrix each frame for clipping
  useFrame(() => {
    if (localSplatRef.current && localSplatRef.current.parent) {
      const globeMesh = localSplatRef.current.parent.children[0] as Mesh; // Assuming parent is the GlassGlobe
      if (globeMesh && globeMesh.updateMatrixWorld) {
        globeMesh.updateMatrixWorld(); // Ensure the matrix is updated
        inverseGlobeUniform.current.value.copy(globeMesh.matrixWorld).invert(); // Store the inverse matrix
      }
    }
  });

  return (
    <group ref={groupRef} />
  );
});
