import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';
import { FlameFX } from './FlameFX';

// OUTDOOR TORCH - Torcia decorativa con collisione + fiamma in punta
export const Torch = ({
    position,
    scale = 1,
    rotation = 0,
    flameOffset = [0, 1, 0],
    flameScale = 0.7,
}) => {
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

    // Posizione world della punta = position + offset (la torcia non ruota in altezza)
    const flamePos = [
        position[0] + flameOffset[0],
        position[1] + flameOffset[1] * scale,
        position[2] + flameOffset[2],
    ];

    return (
        <>
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

            <FlameFX
                position={flamePos}
                scale={flameScale}
                color="#ffaa44"
                lightIntensity={5}
                lightDistance={10}
            />
        </>
    );
};

// Preload
useGLTF.preload('models/Outdoor_Torch.glb');
