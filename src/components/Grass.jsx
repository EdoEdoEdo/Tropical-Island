import { useGLTF } from '@react-three/drei';
import { memo, useMemo } from 'react';

// GRASS - Ciuffo d'erba decorativo
export const Grass = memo(({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Grass.glb');

    // Clona la scene una sola volta per istanza e abilita ombre.
    // Solo receive: l'erba sottile produce shadow rumorose e costose.
    const cloned = useMemo(() => {
        const clone = scene.clone();
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = true;
            }
        });
        return clone;
    }, [scene]);

    return (
        <primitive
            object={cloned}
            position={position}
            scale={scale}
            rotation={[0, rotation, 0]}
        />
    );
});

// Preload
useGLTF.preload('models/Grass.glb');
