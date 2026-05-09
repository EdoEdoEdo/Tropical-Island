import { useCallback } from 'react';
import { ParticleSystem } from './ParticleSystem';
import { FlameFX } from './FlameFX';

/**
 * Effetto bonfire = fumo che sale + scintille additive + fiamma con luce notturna.
 */
export function BonfireFX({ position = [26, 4, 0] }) {
    const [x, y, z] = position;

    // FUMO: sale lentamente, vento leggero, alpha NormalBlending
    const smokeEmitter = useCallback(
        () => ({
            x: x + (Math.random() - 0.5) * 0.4,
            y: y,
            z: z + (Math.random() - 0.5) * 0.4,
            vx: (Math.random() - 0.5) * 0.4,
            vy: 1.0 + Math.random() * 0.6,
            vz: (Math.random() - 0.5) * 0.4 + 0.3, // brezza
            life: 2.5 + Math.random() * 1.5,
        }),
        [x, y, z],
    );

    // SCINTILLE: salgono velocemente, additive blending
    const sparkEmitter = useCallback(
        () => ({
            x: x + (Math.random() - 0.5) * 0.2,
            y: y - 0.2,
            z: z + (Math.random() - 0.5) * 0.2,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2.5 + Math.random() * 2.0,
            vz: (Math.random() - 0.5) * 1.5,
            life: 0.6 + Math.random() * 0.5,
        }),
        [x, y, z],
    );

    return (
        <>
            <FlameFX
                position={[x, y - 0.3, z]}
                scale={1.6}
                color="#ff8833"
                lightIntensity={10}
                lightDistance={22}
            />
            <ParticleSystem
                count={40}
                emitter={smokeEmitter}
                color="#888888"
                size={1.0}
                opacity={0.35}
                drag={0.92}
            />
            <ParticleSystem
                count={25}
                emitter={sparkEmitter}
                color="#ffaa44"
                size={0.18}
                opacity={1}
                additive
                gravity={-2.5}
                drag={0.96}
            />
        </>
    );
}
