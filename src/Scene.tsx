// Scene.tsx
import { AdaptiveDpr, Environment, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { useState, useEffect } from 'react';
import { GlassGlobeWithLuma } from './components/GlassGlobe';
import { LumaSplats } from './components/LumaSplat';
import { sources, Splat } from "./splats";

function Scene() {
  // Leva controls for performance monitoring and cube size
  const { performance } = useControls('Monitoring', {
    performance: false,
  });

  const { size } = useControls('Cube', {
    size: {
      value: 3,
      min: 1,
      max: 10,
      step: 0.1,
    },
  });

  // State to track the current index of the Luma source
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to handle cycling to the next Luma source
  const handleNextLumaSource = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sources.length);
  };

  // Event listener for keydown events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevent default space bar behavior (e.g., scrolling)
        handleNextLumaSource();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Optional: Display the current name for debugging or UI purposes
  const currentSplat: Splat = sources[currentIndex];

  return (
    <>
      {performance && <Perf position='top-left' />}
      <AdaptiveDpr pixelated />
      <OrbitControls makeDefault />

      <GlassGlobeWithLuma
        innerGlobeRadius={size}
        lumaSource={`https://lumalabs.ai/capture/${currentSplat.id}`}
      />


    </>
  );
}

export { Scene };
