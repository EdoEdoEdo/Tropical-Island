import { Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { dayNightState } from './dayNightState';

/**
 * Stelle visibili gradualmente al calare della notte.
 * Opacità calcolata da dayNightState.time:
 *   midday (0)  → 0
 *   sunset(0.25)→ 0
 *   night (0.5) → 1
 *   dawn  (0.75)→ 0
 */
export function NightStars() {
    const groupRef = useRef();
    const matRef = useRef();

    useFrame(() => {
        if (!groupRef.current) return;
        const t = dayNightState.time;
        // Curva: 0 a sunset/dawn, 1 a night
        // distanza angolare da night (0.5)
        const dist = Math.min(
            Math.abs(t - 0.5),
            Math.abs(t - 0.5 + 1),
            Math.abs(t - 0.5 - 1),
        );
        // dist=0 → 1, dist>=0.25 → 0
        const opacity = Math.max(0, 1 - dist / 0.22);

        groupRef.current.visible = opacity > 0.01;
        // Stars usa pointsMaterial → cerca il primo material e regola opacity
        groupRef.current.traverse((c) => {
            if (c.material) {
                c.material.transparent = true;
                c.material.opacity = opacity;
                c.material.depthWrite = false;
            }
        });
    });

    return (
        <group ref={groupRef}>
            <Stars
                radius={300}
                depth={60}
                count={4500}
                factor={10}
                saturation={0}
                fade
                speed={0.3}
            />
        </group>
    );
}
