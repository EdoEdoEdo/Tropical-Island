import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// MOAI - Statua Testa di Pietra
export const House = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Cabin.glb');

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
            name="house"
        >
            {/* Collider semplificato (statua) */}
            <CuboidCollider args={[10.0, 10.0, 16.0]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Cabin.glb');
