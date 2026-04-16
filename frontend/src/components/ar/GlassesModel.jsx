import React, { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const FAILSAFE_MODEL = 'https://res.cloudinary.com/dfg9uh4cc/image/upload/v1776324744/glass1_sqdfcb.glb';

const GlassesModel = ({ modelPath, color }) => {
  const [scene, setScene] = useState(null);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    const loader = new GLTFLoader();
    let isMounted = true;

    const loadWithFallback = (path, isFallback = false) => {
      loader.load(
        path,
        (gltf) => {
          if (isMounted) {
            setScene(gltf.scene);
            setLoadingError(isFallback);
          }
        },
        undefined,
        (err) => {
          console.error(`Error loading model at ${path}:`, err);
          if (!isFallback && path !== FAILSAFE_MODEL) {
            console.log('Attempting to load failsafe model...');
            loadWithFallback(FAILSAFE_MODEL, true);
          } else {
            console.error('All model loading attempts failed.');
          }
        }
      );
    };

    loadWithFallback(modelPath || FAILSAFE_MODEL);

    return () => {
      isMounted = false;
    };
  }, [modelPath]);
  
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name === 'Plane001') {
          if (child.material) child.material.color.set(color);
        }
        if (child.name === 'Plane') {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.6;
            child.material.color.set('#000000');
          }
        }
      }
    });
  }, [scene, color]);

  if (!scene) return null;

  return (
    <primitive object={scene} scale={1.5} position={[0, -0.2, 0]} />
  );
};

export default GlassesModel;
