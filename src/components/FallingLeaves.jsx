import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';

const COUNT = 80;
const ISLAND_RADIUS = 30;

/**
 * Foglie/petali che cadono lentamente dall'alto sull'area centrale dell'isola.
 * Ogni particella loop indipendentemente (respawn quando arriva a terra).
 */
export function FallingLeaves() {
    const positions = useMemo(() => new Float32Array(COUNT * 3), []);
    const velocities = useMemo(() => new Float32Array(COUNT * 3), []);

    const geometry = useMemo(() => {
        const g = new BufferGeometry();
        for (let i = 0; i < COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * ISLAND_RADIUS;
            positions[i * 3 + 0] = Math.cos(angle) * r;
            positions[i * 3 + 1] = 8 + Math.random() * 12;
            positions[i * 3 + 2] = Math.sin(angle) * r;
            velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.3;
            velocities[i * 3 + 1] = -(0.4 + Math.random() * 0.4);
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
        g.setAttribute('position', new BufferAttribute(positions, 3));
        return g;
    }, [positions, velocities]);

    useFrame((state, delta) => {
        const dt = Math.min(delta, 0.1);
        const t = state.clock.getElapsedTime();
        for (let i = 0; i < COUNT; i++) {
            // Drift sinusoidale (effetto svolazzo)
            positions[i * 3 + 0] +=
                (velocities[i * 3 + 0] + Math.sin(t + i) * 0.4) * dt;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
            positions[i * 3 + 2] +=
                (velocities[i * 3 + 2] + Math.cos(t + i) * 0.4) * dt;

            // Respawn al suolo
            if (positions[i * 3 + 1] < 2.5) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * ISLAND_RADIUS;
                positions[i * 3 + 0] = Math.cos(angle) * r;
                positions[i * 3 + 1] = 14 + Math.random() * 6;
                positions[i * 3 + 2] = Math.sin(angle) * r;
            }
        }
        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points geometry={geometry} frustumCulled={false}>
            <pointsMaterial
                color="#9cb86a"
                size={0.25}
                sizeAttenuation
                transparent
                opacity={0.7}
                depthWrite={false}
            />
        </points>
    );
}
