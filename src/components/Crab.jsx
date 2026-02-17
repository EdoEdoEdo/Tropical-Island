import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Ombrellone
export const Crab = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Crab.glb');

    // Abilita ombre
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Cambia il colore
                if (child.material) {
                    child.material.color.set('#ff0000');
                }
            }
        });
    }, [scene]);

    return (
        <RigidBody
            type="fixed"
            position={position}
            rotation={[0, rotation, 0]}
            colliders={false}
            name="crab"
        >
            {/* Collider semplificato */}
            <CuboidCollider args={[0.25, 0.25, 0.25]} />

            <primitive object={scene.clone()} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Crab.glb');
