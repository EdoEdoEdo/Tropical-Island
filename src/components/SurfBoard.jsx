import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { surfState } from './surfState';
import { playerState } from './playerState';

export function SurfBoard() {
    const { scene } = useGLTF('models/Surfboard_1.glb');
    const cloned = useMemo(() => scene.clone(true), [scene]);
    const groupRef = useRef();
    const innerRef = useRef();

    useFrame(({ clock }) => {
        if (!surfState.active) {
            if (groupRef.current?.visible) groupRef.current.visible = false;
            return;
        }
        if (!groupRef.current) return;
        if (!groupRef.current.visible) groupRef.current.visible = true;

        // Segui il player
        groupRef.current.position.set(
            playerState.x,
            playerState.y - 0.4,
            playerState.z,
        );
        // Yaw del player
        groupRef.current.rotation.y = playerState.rotY;

        // Tilt + bobbing (ruoli locali sull'inner per non interferire col yaw)
        if (innerRef.current) {
            const t = clock.getElapsedTime();
            // Roll laterale: tilt del game
            innerRef.current.rotation.z = -surfState.tilt * 0.45;
            // Pitch: bobbing onda
            innerRef.current.rotation.x = Math.sin(t * 1.6) * 0.08;
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            <group ref={innerRef}>
                {/* Ruota la tavola in orizzontale: il modello base è verticale */}
                <primitive
                    object={cloned}
                    scale={0.15}
                    rotation={[0, 0, Math.PI / 2]}
                    position={[0, -0.1, 0]}
                />
            </group>
        </group>
    );
}

useGLTF.preload('models/Surfboard_1.glb');
