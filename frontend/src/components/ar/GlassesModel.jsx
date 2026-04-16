import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const GlassesModel = ({ modelPath, color }) => {
  const { scene } = useGLTF(modelPath || 'https://res.cloudinary.com/dfg9uh4cc/image/upload/v1776324744/glass1_sqdfcb.glb');
  
  useEffect(() => {
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

  return (
    <primitive object={scene} scale={1.5} position={[0, -0.2, 0]} />
  );
};

export default GlassesModel;
