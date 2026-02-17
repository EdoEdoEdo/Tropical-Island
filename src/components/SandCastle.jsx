import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useEffect } from 'react';

// Ombrellone
export const SandCastle = ({ position, scale = 1, rotation = 0 }) => {
    const { scene } = useGLTF('models/Sand_Castle.glb');

    // Abilita ombre
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Cambia il colore, ad esempio rosso
                if (child.material) {
                    child.material.color.set('#a87324'); // cambia con il colore che vuoi
                    // Se vuoi cambiare più proprietà:
                    // child.material.emissive.set('#330000');
                    // child.material.needsUpdate = true; (a volte serve)
                }
            }
        });
    }, [scene]);

    return (
        <RigidBody
            type="fixed"
            position={position}
            rotation={[0, rotation, 0]}
            colliders={false}
            name="sand_castle"
        >
            {/* Collider semplificato (statua) */}
            <CuboidCollider args={[1, 1, 1]} />

            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

// Preload
useGLTF.preload('models/Sand_Castle.glb');
