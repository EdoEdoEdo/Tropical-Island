import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useEffect } from 'react';

// STONE - Pietra decorativa con collisione
export const Stone = ({
    position,
    scale = 1,
    rotation = 0,
    withCollision = false,
}) => {
    const { scene } = useGLTF('models/Stone.glb');

    // Abilita ombre
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    const stoneModel = (
        <primitive
            object={scene.clone()}
            scale={scale}
            rotation={[0, rotation, 0]}
        />
    );

    // Con o senza collisione
    if (withCollision) {
        return (
            <RigidBody
                type="fixed"
                colliders="hull"
                position={position}
                name="stone"
            >
                {stoneModel}
            </RigidBody>
        );
    }

    return <group position={position}>{stoneModel}</group>;
};

// Preload
useGLTF.preload('models/Stone.glb');
