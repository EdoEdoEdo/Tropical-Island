import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CylinderCollider, RigidBody } from '@react-three/rapier';
import { useEffect, useMemo, useRef } from 'react';
import { Grass } from './Grass';

// PALMA GLB con sway al vento + collider tronco
export const PalmTree = ({
    position,
    variant = 1,
    scale = 1,
    rotation = 0,
}) => {
    const modelPath = `models/Palm_Tree_${variant}.glb`;
    const { scene } = useGLTF(modelPath);

    // Clone unico per istanza (per non condividere shadows/material)
    const cloned = useMemo(() => scene.clone(), [scene]);

    useEffect(() => {
        cloned.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [cloned]);

    // Sway: ruoto leggermente il group del modello (no shader, mobile-safe)
    // Phase random per palma → niente movimento sincrono fastidioso
    const swayPhase = useMemo(() => Math.random() * Math.PI * 2, []);
    const swayRef = useRef();

    useFrame(({ clock }) => {
        if (!swayRef.current) return;
        const t = clock.getElapsedTime();
        // Movimento dolce ondulatorio + raffica veloce
        const sx = Math.sin(t * 0.7 + swayPhase) * 0.05;
        const sz = Math.cos(t * 0.55 + swayPhase * 1.3) * 0.04;
        swayRef.current.rotation.x = sx;
        swayRef.current.rotation.z = sz;
    });

    return (
        <group>
            <RigidBody
                type="fixed"
                colliders={false}
                position={position}
                rotation={[0, rotation, 0]}
                name="palm-tree"
            >
                {/* Group sway: pivot a metà tronco per piegare la chioma */}
                <group ref={swayRef} position={[0, 0, 0]}>
                    <primitive object={cloned} scale={scale} />
                </group>
                <CylinderCollider
                    args={[1.5 * scale, 0.3 * scale]}
                    position={[0, 1.5 * scale, 0]}
                />
            </RigidBody>

            <Grass
                position={[position[0], position[1] - 0.3, position[2]]}
                scale={2.5}
                rotation={0}
            />
        </group>
    );
};

useGLTF.preload('models/Palm_Tree_1.glb');
useGLTF.preload('models/Palm_Tree_2.glb');
useGLTF.preload('models/Palm_Tree_3.glb');
