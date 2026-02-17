import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Ombrellone
export const ChaiseLounge = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Chaise_Lounge.glb');

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
            name="chaise_lounge"
        >
            {/* Collider semplificato (statua) */}
            <CuboidCollider args={[2.0, 0.5, 1]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Chaise_Lounge.glb');
