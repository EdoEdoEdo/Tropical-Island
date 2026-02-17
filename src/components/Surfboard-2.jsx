import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Fuoco
export const SurfboardTwo = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Surfboard_2.glb');

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
            name="sufrboard-two"
        >
            {/* Collider semplificato (statua) */}
            <CuboidCollider args={[3.0, 0.5, 1]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Surfboard_2.glb');
