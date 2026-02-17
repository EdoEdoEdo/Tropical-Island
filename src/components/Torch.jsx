import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// OUTDOOR TORCH - Torcia decorativa con collisione
export const Torch = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Outdoor_Torch.glb');

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
            name="torch"
        >
            <CuboidCollider args={[0.2, 3, 0.2]} />

            <primitive object={scene.clone()} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Outdoor_Torch.glb');
