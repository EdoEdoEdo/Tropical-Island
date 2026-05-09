import { useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ParticleSystem } from './ParticleSystem';
import { dayNightState } from './dayNightState';

/**
 * Effetto fiamma riutilizzabile: scintille additive + glow billboard + PointLight
 * con intensità modulata dal giorno/notte (max di notte, quasi spenta di giorno).
 *
 * Props:
 *  - position: world [x, y, z] della base della fiamma
 *  - scale:   moltiplicatore generale (1 = torcia tipica, 2-3 = falò)
 *  - color:   colore fiamma (default arancio caldo)
 *  - lightIntensity: intensità massima della PointLight di notte
 *  - lightDistance:  raggio di influenza della PointLight
 */
export function FlameFX({
    position = [0, 0, 0],
    scale = 1,
    color = '#ffaa44',
    lightIntensity = 6,
    lightDistance = 12,
}) {
    const [x, y, z] = position;
    const lightRef = useRef();
    const glowRef = useRef();

    // Scintille additive che salgono
    const sparkEmitter = useCallback(
        () => ({
            x: x + (Math.random() - 0.5) * 0.15 * scale,
            y: y,
            z: z + (Math.random() - 0.5) * 0.15 * scale,
            vx: (Math.random() - 0.5) * 0.5 * scale,
            vy: (1.2 + Math.random() * 1.2) * scale,
            vz: (Math.random() - 0.5) * 0.5 * scale,
            life: 0.5 + Math.random() * 0.4,
        }),
        [x, y, z, scale],
    );

    useFrame(({ clock }) => {
        // 0 = giorno, 1 = notte
        const night = 1 - dayNightState.sunAbove;
        // flicker leggero
        const t = clock.elapsedTime;
        const flicker =
            0.85 +
            0.15 *
                (Math.sin(t * 18) * 0.5 +
                    Math.sin(t * 27 + 1.3) * 0.3 +
                    Math.sin(t * 9) * 0.2);

        if (lightRef.current) {
            lightRef.current.intensity =
                lightIntensity * night * flicker + 0.2 * flicker;
        }
        if (glowRef.current) {
            const pulse = 0.9 + 0.1 * Math.sin(t * 12);
            glowRef.current.scale.setScalar(scale * 0.6 * pulse);
            // glow visibile sempre, più intenso di notte
            glowRef.current.material.opacity = 0.55 + 0.35 * night;
        }
    });

    return (
        <group>
            {/* Scintille additive */}
            <ParticleSystem
                count={28}
                emitter={sparkEmitter}
                color={color}
                size={0.16 * scale}
                opacity={1}
                additive
                gravity={-1.8}
                drag={0.94}
            />

            {/* Glow billboard caldo (sprite-like via mesh additivo) */}
            <mesh ref={glowRef} position={[x, y + 0.15 * scale, z]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.7}
                    depthWrite={false}
                    blending={2 /* AdditiveBlending */}
                    toneMapped={false}
                />
            </mesh>

            {/* Luce dinamica - max di notte, quasi spenta di giorno */}
            <pointLight
                ref={lightRef}
                position={[x, y + 0.5 * scale, z]}
                color={color}
                intensity={lightIntensity}
                distance={lightDistance}
                decay={2}
                castShadow={false}
            />
        </group>
    );
}
