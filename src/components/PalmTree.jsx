import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useEffect } from 'react';
import { Grass } from './Grass';

// PALMA GLB con Collisione - 3 Varianti + Erba alla base
export const PalmTree = ({
    position,
    variant = 1,
    scale = 1,
    rotation = 0,
}) => {
    // Carica il modello GLB in base alla variante
    const modelPath = `models/Palm_Tree_${variant}.glb`;
    const { scene } = useGLTF(modelPath);

    // Abilita ombre su tutti i mesh del modello
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        }
    }, [scene]);

    return (
        <group>
            {/* Palma con collisione */}
            <RigidBody
                type="fixed"
                colliders="hull"
                position={position}
                rotation={[0, rotation, 0]}
                name="palm-tree"
            >
                <primitive object={scene.clone()} scale={scale} />
            </RigidBody>

            {/* Erba alla base della palma - posizione leggermente sotto */}
            <Grass
                position={[position[0], position[1] - 0.3, position[2]]}
                scale={2.5}
                rotation={0}
            />
        </group>
    );
};

// Preload tutti e 3 i modelli
useGLTF.preload('models/Palm_Tree_1.glb');
useGLTF.preload('models/Palm_Tree_2.glb');
useGLTF.preload('models/Palm_Tree_3.glb');
