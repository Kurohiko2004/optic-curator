import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
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
    const isFailsafe = modelPath === FAILSAFE_MODEL;
    let largestMesh = null;
    let maxVolume = 0;

    scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        const isLens = name.includes('lens') || name.includes('glass') || name === 'plane';

        if (isLens) {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.6;
            child.material.color.set('#000000');
          }
        } else if (isFailsafe) {
          // Special case: failsafe model frame is Plane001
          if (child.name === 'Plane001') {
            child.material.color.set(color);
          }
        } else {
          // Standard logic: find biggest for normal models
          child.geometry.computeBoundingBox();
          const size = new THREE.Vector3();
          child.geometry.boundingBox.getSize(size);
          const volume = size.x * size.y * size.z;

          if (volume > maxVolume) {
            maxVolume = volume;
            largestMesh = child;
          }
        }
      }
    });

    if (!isFailsafe && largestMesh && largestMesh.material) {
      largestMesh.material.color.set(color);
    }
  }, [scene, color]);

  if (!scene) return null;

  return (
    <primitive object={scene} scale={1.5} position={[0, -0.2, 0]} />
  );
};

export default GlassesModel;
