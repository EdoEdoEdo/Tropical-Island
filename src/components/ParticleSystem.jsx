import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    NormalBlending,
} from 'three';

/**
 * Sistema particellare generico basato su Points + BufferGeometry.
 * - count: numero particelle simultanee
 * - emitter: () => ({x,y,z, vx,vy,vz, life}) chiamato per ricreare particelle morte
 * - color, size, blending
 */
export function ParticleSystem({
    count = 60,
    emitter,
    color = '#ffffff',
    size = 0.15,
    additive = false,
    opacity = 0.8,
    sizeAttenuation = true,
    gravity = 0,
    drag = 1,
}) {
    const pointsRef = useRef();
    const dataRef = useRef();

    // Stato particelle: positions + velocities + lifetimes
    const { positions, velocities, lifetimes, ages, geometry } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const lifetimes = new Float32Array(count);
        const ages = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const p = emitter();
            positions[i * 3 + 0] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
            velocities[i * 3 + 0] = p.vx;
            velocities[i * 3 + 1] = p.vy;
            velocities[i * 3 + 2] = p.vz;
            lifetimes[i] = p.life;
            ages[i] = Math.random() * p.life; // distribuiti
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        return { positions, velocities, lifetimes, ages, geometry };
    }, [count, emitter]);

    dataRef.current = { positions, velocities, lifetimes, ages, geometry };

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.1);
        const dragK = Math.pow(drag, dt);

        for (let i = 0; i < count; i++) {
            ages[i] += dt;
            if (ages[i] >= lifetimes[i]) {
                // Respawn
                const p = emitter();
                positions[i * 3 + 0] = p.x;
                positions[i * 3 + 1] = p.y;
                positions[i * 3 + 2] = p.z;
                velocities[i * 3 + 0] = p.vx;
                velocities[i * 3 + 1] = p.vy;
                velocities[i * 3 + 2] = p.vz;
                lifetimes[i] = p.life;
                ages[i] = 0;
                continue;
            }
            // Apply velocity
            positions[i * 3 + 0] += velocities[i * 3 + 0] * dt;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
            // Gravity + drag
            velocities[i * 3 + 1] += gravity * dt;
            velocities[i * 3 + 0] *= dragK;
            velocities[i * 3 + 2] *= dragK;
        }
        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
            <pointsMaterial
                color={color}
                size={size}
                sizeAttenuation={sizeAttenuation}
                transparent
                opacity={opacity}
                depthWrite={false}
                blending={additive ? AdditiveBlending : NormalBlending}
            />
        </points>
    );
}
