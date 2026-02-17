import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useMemo } from 'react';

// OCEAN BARRIER - Barriera invisibile circolare nel mare
export const OceanBarrier = ({
    radius = 105, // Raggio barriera (4-5m oltre l'isola 100m)
    height = 20, // Altezza muro
    thickness = 2, // Spessore
}) => {
    // Geometria cilindrica cava
    const geometry = useMemo(() => {
        const segments = 64;
        const geo = new THREE.CylinderGeometry(
            radius, // Raggio top
            radius, // Raggio bottom
            height, // Altezza
            segments, // Segmenti
            1, // Height segments
            true, // Open ended (aperto sopra/sotto)
        );
        return geo;
    }, [radius, height]);

    return (
        <RigidBody
            type="fixed"
            colliders="trimesh"
            name="ocean-barrier"
            position={[0, height / 2, 0]}
        >
            <mesh geometry={geometry} visible={true}>
                <meshBasicMaterial
                    transparent
                    opacity={0}
                    colorWrite={false} // ← Non scrive nel color buffer
                    depthWrite={false} // ← Non scrive nel depth buffer
                />
            </mesh>
        </RigidBody>
    );
};
