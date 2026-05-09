import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';
import { playerState } from './playerState';

const COUNT = 30;

/**
 * Particelle di sabbia che si sollevano sotto il player quando cammina.
 * Le particelle vengono emesse alla posizione attuale del player ed evolvono.
 */
export function FootstepParticles() {
    const positions = useMemo(() => new Float32Array(COUNT * 3), []);
    const velocities = useMemo(() => new Float32Array(COUNT * 3), []);
    const lifetimes = useMemo(() => new Float32Array(COUNT), []);
    const ages = useMemo(() => new Float32Array(COUNT).fill(99), []);

    const geometry = useMemo(() => {
        const g = new BufferGeometry();
        g.setAttribute('position', new BufferAttribute(positions, 3));
        return g;
    }, [positions]);

    const cursor = useRef(0);
    const emitTimer = useRef(0);

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.1);

        // Emissione: solo se moving e onGround
        if (playerState.moving && playerState.onGround) {
            emitTimer.current += dt;
            if (emitTimer.current > 0.06) {
                emitTimer.current = 0;
                const i = cursor.current;
                positions[i * 3 + 0] =
                    playerState.x + (Math.random() - 0.5) * 0.3;
                positions[i * 3 + 1] = playerState.y - 1.0;
                positions[i * 3 + 2] =
                    playerState.z + (Math.random() - 0.5) * 0.3;
                velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.6;
                velocities[i * 3 + 1] = 0.5 + Math.random() * 0.5;
                velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
                lifetimes[i] = 0.7 + Math.random() * 0.3;
                ages[i] = 0;
                cursor.current = (i + 1) % COUNT;
            }
        }

        // Update tutte
        for (let i = 0; i < COUNT; i++) {
            if (ages[i] >= lifetimes[i]) {
                positions[i * 3 + 1] = -100; // nascondi
                continue;
            }
            ages[i] += dt;
            positions[i * 3 + 0] += velocities[i * 3 + 0] * dt;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
            velocities[i * 3 + 1] -= 1.5 * dt; // leggera gravità
            velocities[i * 3 + 0] *= 0.94;
            velocities[i * 3 + 2] *= 0.94;
        }
        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points geometry={geometry} frustumCulled={false}>
            <pointsMaterial
                color="#e8c890"
                size={0.25}
                sizeAttenuation
                transparent
                opacity={0.6}
                depthWrite={false}
            />
        </points>
    );
}
