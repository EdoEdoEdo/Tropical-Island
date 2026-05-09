import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { playerState } from './playerState';

const tmpDir = new Vector3();
const tmpAway = new Vector3();

/**
 * Granchio che vaga lungo dei waypoints.
 * Se il player si avvicina < fleeDist, scappa nella direzione opposta.
 */
export const Crab = ({
    position,
    rotation = 0,
    scale = 0.0015,
    waypointRadius = 3,
    speed = 1.4,
    fleeDist = 4,
}) => {
    const { scene } = useGLTF('models/Crab.glb');

    // Clone scene per ogni granchio
    const cloned = useMemo(() => {
        const c = scene.clone(true);
        c.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = true;
                if (child.material) {
                    child.material = child.material.clone();
                    child.material.color.set('#d63a3a');
                }
            }
        });
        return c;
    }, [scene]);

    const groupRef = useRef();
    const pos = useRef(new Vector3(...position));
    const target = useRef(new Vector3(...position));
    const heading = useRef(rotation);

    // Genera nuovo waypoint random attorno alla posizione iniziale
    const pickNewTarget = () => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * waypointRadius;
        target.current.set(
            position[0] + Math.cos(a) * r,
            position[1],
            position[2] + Math.sin(a) * r,
        );
    };

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        // FLEE: se il player è vicino, scappa
        const dx = pos.current.x - playerState.x;
        const dz = pos.current.z - playerState.z;
        const distToPlayer = Math.sqrt(dx * dx + dz * dz);

        let moveSpeed = speed;
        if (distToPlayer < fleeDist) {
            tmpAway.set(dx, 0, dz).normalize().multiplyScalar(2);
            target.current.copy(pos.current).add(tmpAway);
            moveSpeed = speed * 2.5; // scappa più veloce
        } else {
            // Reached target → pick new
            const tx = target.current.x - pos.current.x;
            const tz = target.current.z - pos.current.z;
            if (tx * tx + tz * tz < 0.25) pickNewTarget();
        }

        // Move toward target
        tmpDir.set(
            target.current.x - pos.current.x,
            0,
            target.current.z - pos.current.z,
        );
        const len = tmpDir.length();
        if (len > 0.01) {
            tmpDir.divideScalar(len);
            pos.current.x += tmpDir.x * moveSpeed * delta;
            pos.current.z += tmpDir.z * moveSpeed * delta;
            // Heading verso direzione movimento (smooth lerp)
            const desiredHeading = Math.atan2(tmpDir.x, tmpDir.z);
            let dh = desiredHeading - heading.current;
            while (dh > Math.PI) dh -= Math.PI * 2;
            while (dh < -Math.PI) dh += Math.PI * 2;
            heading.current += dh * Math.min(1, delta * 8);
        }

        groupRef.current.position.copy(pos.current);
        groupRef.current.rotation.y = heading.current;
    });

    return (
        <group ref={groupRef} scale={scale}>
            {/* Modello ruotato 180° perché di base cammina all'indietro */}
            <primitive object={cloned} rotation={[0, Math.PI, 0]} />
        </group>
    );
};

useGLTF.preload('models/Crab.glb');
