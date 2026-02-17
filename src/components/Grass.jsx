import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

// GRASS - Ciuffo d'erba decorativo
export const Grass = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Grass.glb');

    // Abilita ombre
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    return (
        <primitive
            object={scene.clone()}
            position={position}
            scale={scale}
            rotation={[0, rotation, 0]}
        />
    );
};

// Preload
useGLTF.preload('models/Grass.glb');
