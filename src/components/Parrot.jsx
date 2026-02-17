import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Ombrellone
export const Parrot = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Parrot.glb');

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
        <RigidBody
            type="fixed"
            position={position}
            rotation={[0, rotation, 0]}
            colliders={false}
            name="parrot"
        >
            {/* Collider semplificato */}
            <CuboidCollider args={[0.5, 0.5, 0.5]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Parrot.glb');
