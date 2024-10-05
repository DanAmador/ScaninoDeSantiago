// Scene.tsx
import { AdaptiveDpr, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import { useState, useEffect } from 'react';
import { GlassGlobeWithLuma } from './components/GlassGlobe';
import useSplatData, { SplatDataset } from './useSplatData';
import { useSplatControls } from './useSplatMetadataControls';

function Scene() {

  const [currentIndex, setCurrentIndex] = useState(0);
  const { splats } = useSplatData();


  const [currentSplat, setCurrentSplat] = useState<Partial<SplatDataset> | null>(null);

  useSplatControls(currentSplat, (updatedSplat) => {
    if (currentSplat) {
      setCurrentSplat((prevSplat) => ({ ...prevSplat, ...updatedSplat }));
    }
  });
  useEffect(() => {
    if (splats.length > 0) {
      setCurrentSplat(splats[currentIndex]);
    }
  }, [currentIndex, splats]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && splats.length > 0) {
        event.preventDefault();
        setCurrentIndex((prevIndex) => (prevIndex + 1) % splats.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);


    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [splats]);

  return (
    <>
      <AdaptiveDpr pixelated />
      <OrbitControls makeDefault />

      {currentSplat && <GlassGlobeWithLuma {...currentSplat} />}
    </>
  );
}

export { Scene };
