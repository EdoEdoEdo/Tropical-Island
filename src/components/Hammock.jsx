import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Ombrellone
export const Hammock = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Hammock.glb');

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
            name="hammock"
        >
            {/* 2 pali verticali alle estremità */}
            <CuboidCollider args={[0.2, 1.5, 0.2]} position={[-2.4, -1.0, 0]} />
            <CuboidCollider args={[0.2, 1.5, 0.2]} position={[2.4, -1.0, 0]} />
            {/* Telo dell'amaca al centro, basso */}
            <CuboidCollider args={[2.0, 0.25, 0.7]} position={[0, -1.5, 0]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Hammock.glb');
