import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Ombrellone
export const BeachChair = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Beach_Chair.glb');

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
            name="beach_chair"
        >
            {/* Collider semplificato (statua) */}
            <CuboidCollider args={[1.0, 1.0, 1.0]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Beach_Chair.glb');
