import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { useStore } from './useStore';
import { playerState } from './playerState';

// Replica della formula in CoastalTerrain.jsx — calcola l'altezza del terreno
// in (x, z) world. Permette di posizionare oggetti sopra il suolo.
function terrainHeight(x, z) {
    const radius = 100; // size/2
    const d = Math.sqrt(x * x + z * z);
    if (d < radius * 0.7) {
        const centerFactor = 1 - d / (radius * 0.7);
        let h = Math.pow(centerFactor, 1.5) * 6.0;
        // Stesso noise dello shader (così il match è fedele)
        const noiseX = Math.sin(x * 0.15) * Math.cos(z * 0.15);
        const noiseY = Math.cos(x * 0.12) * Math.sin(z * 0.18);
        h += (noiseX + noiseY) * 0.3;
        return h;
    }
    if (d < radius) {
        const beachFactor = 1 - (d - radius * 0.7) / (radius * 0.3);
        return beachFactor * 0.5;
    }
    return 0;
}

const FLOAT_OFFSET = 1.6; // quanto sopra il terreno fluttuano le sfere
const WATER_LEVEL = 0.9;

// Posizioni XZ delle 12 sfere: la Y verrà calcolata in base al terreno
const ORB_XZ = [
    [0, 22], // davanti al cinema
    [-20, 8], // ovest
    [-18, -8], // est-nord
    [24, -3], // est bonfire
    [18, 11], // hammock
    [9, 9], // info board
    [3, -18], // davanti moai
    [-12, 14],
    [14, -10],
    [-15, -12],
    [12, 16],
    [-6, -8],
];

export const ORB_POSITIONS = ORB_XZ.map(([x, z]) => {
    const ground = Math.max(terrainHeight(x, z), WATER_LEVEL);
    return [x, ground + FLOAT_OFFSET, z];
});

const COLLECT_RADIUS = 3;

// === FX SUONO === beep sintetizzato (WebAudio), no asset
let audioCtx;
function playCollectSound() {
    try {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.18);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.32);
    } catch {}
}

function Orb({ position, index }) {
    const groupRef = useRef();
    const haloRef = useRef();
    const collectedRef = useRef(false);
    const burstTimeRef = useRef(-1); // tempo di raccolta, -1 se non raccolta

    useFrame(({ clock }) => {
        const g = groupRef.current;
        if (!g) return;
        const t = clock.getElapsedTime();

        // Burst FX dopo raccolta: scala+fade per 0.5s poi nascondi
        if (collectedRef.current) {
            const dt = t - burstTimeRef.current;
            if (dt > 0.5) {
                if (g.visible) g.visible = false;
                return;
            }
            const k = dt / 0.5; // 0→1
            const scale = 1 + k * 2.5;
            g.scale.setScalar(scale);
            const op = 1 - k;
            g.children.forEach((c) => {
                if (c.material) c.material.opacity = op;
            });
            return;
        }

        // Bobbing + rotazione
        g.position.y = position[1] + Math.sin(t * 2 + index) * 0.35;
        g.rotation.y = t * 1.5;
        // Halo pulse
        if (haloRef.current) {
            const pulse = 1 + Math.sin(t * 3 + index) * 0.08;
            haloRef.current.scale.setScalar(pulse);
        }

        // Check distanza player
        const dx = playerState.x - position[0];
        const dy = playerState.y - position[1];
        const dz = playerState.z - position[2];
        if (dx * dx + dy * dy + dz * dz < COLLECT_RADIUS * COLLECT_RADIUS) {
            collectedRef.current = true;
            burstTimeRef.current = t;
            playCollectSound();
            useStore.getState().collectOrb();
        }
    });

    return (
        <group ref={groupRef} position={position} frustumCulled={false}>
            {/* Sfera centrale */}
            <mesh frustumCulled={false}>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshBasicMaterial
                    color="#ffe066"
                    toneMapped={false}
                    transparent
                    opacity={1}
                />
            </mesh>
            {/* Halo esterno trasparente */}
            <mesh ref={haloRef} frustumCulled={false}>
                <sphereGeometry args={[0.95, 16, 16]} />
                <meshBasicMaterial
                    color="#fff5a0"
                    toneMapped={false}
                    transparent
                    opacity={0.25}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

/**
 * Manager mini-game. Materiali basic, nessuna luce dinamica → mobile-friendly.
 */
export function OrbHunt() {
    const status = useStore((s) => s.orbHunt.status);

    useFrame((_, delta) => {
        if (useStore.getState().orbHunt.status === 'playing') {
            useStore.getState().tickOrbHunt(delta);
        }
    });

    if (status !== 'playing') return null;

    return (
        <group key={status}>
            {ORB_POSITIONS.map((p, i) => (
                <Orb key={i} position={p} index={i} />
            ))}
        </group>
    );
}
