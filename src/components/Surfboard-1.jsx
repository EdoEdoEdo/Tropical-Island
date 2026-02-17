import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Fuoco
export const SurfboardOne = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Surfboard_1.glb');

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
            name="sufrboard-one"
        >
            {/* Collider semplificato (statua) */}
            <CuboidCollider args={[1.0, 7.0, 1.0]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Surfboard_1.glb');
