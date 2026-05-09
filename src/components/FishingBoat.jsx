import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { fishingState } from './fishingState';
import { playerState } from './playerState';

// Offset della barca rispetto al player (in coord locali player):
// x = laterale, y = altezza (negativa = sotto al player), z = avanti/indietro
// Vogliamo che il player sia VICINO ALLA PRUA, quindi spostiamo la barca
// indietro lungo Z (lo "guardare avanti" del player è +Z locale rotato di rotY)
const BOAT_LOCAL_OFFSET = { x: 0, y: -0.55, z: -1.3 };

export function FishingBoat() {
    const { scene } = useGLTF('models/Rowboat.glb');
    const cloned = useMemo(() => scene.clone(true), [scene]);
    const groupRef = useRef();
    const innerRef = useRef();

    useFrame(({ clock }) => {
        if (!fishingState.active) {
            if (groupRef.current?.visible) groupRef.current.visible = false;
            return;
        }
        if (!groupRef.current) return;
        if (!groupRef.current.visible) groupRef.current.visible = true;

        // Offset rotato dal yaw del player
        const rotY = playerState.rotY;
        const ox = BOAT_LOCAL_OFFSET.x;
        const oz = BOAT_LOCAL_OFFSET.z;
        const wx = ox * Math.cos(rotY) + oz * Math.sin(rotY);
        const wz = -ox * Math.sin(rotY) + oz * Math.cos(rotY);

        groupRef.current.position.set(
            playerState.x + wx,
            playerState.y + BOAT_LOCAL_OFFSET.y,
            playerState.z + wz,
        );
        groupRef.current.rotation.y = rotY;

        // Bobbing onda dolce
        if (innerRef.current) {
            const t = clock.getElapsedTime();
            innerRef.current.rotation.x = Math.sin(t * 1.1) * 0.05;
            innerRef.current.rotation.z = Math.cos(t * 0.9) * 0.04;
            innerRef.current.position.y = Math.sin(t * 1.1) * 0.08;
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            <group ref={innerRef}>
                <primitive object={cloned} scale={0.11} />
            </group>
        </group>
    );
}

useGLTF.preload('models/Rowboat.glb');
