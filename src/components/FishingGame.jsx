import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { useStore } from './useStore';
import { fishingState } from './fishingState';
import { playerState } from './playerState';

const WATER_Y = 0.9;
const FLIGHT_DURATION = 1.0; // s
const FLIGHT_ARC = 5;
const SINK_DEPTH = 0.6; // quanto affonda quando il pesce abbocca

// Distanza minima/massima del lancio (metri sull'acqua)
const MIN_CAST = 4;
const MIN_FORWARD = 5; // distanza minima lungo la direzione di vista del player
const MAX_CAST = 35;

let _splashId = 0;

function Splash({ position, onDone }) {
    const ref = useRef();
    const t0Ref = useRef(null);
    useFrame(({ clock }) => {
        if (t0Ref.current === null) t0Ref.current = clock.getElapsedTime();
        const k = (clock.getElapsedTime() - t0Ref.current) / 0.6;
        if (k >= 1) {
            onDone();
            return;
        }
        if (!ref.current) return;
        const s = 0.3 + k * 2;
        ref.current.scale.setScalar(s);
        ref.current.material.opacity = 1 - k;
    });
    return (
        <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.6, 18]} />
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={1}
                toneMapped={false}
                depthWrite={false}
            />
        </mesh>
    );
}

export function FishingGame() {
    const status = useStore((s) => s.fishingGame.status);
    const phase = useStore((s) => s.fishingGame.phase);
    const setPhase = useStore((s) => s.setFishingPhase);

    const bobberRef = useRef();
    const flightRef = useRef(null); // { start, target, t0 }
    const baseBobberPosRef = useRef(null); // posizione "tranquilla" del bobber in waiting
    const sinkRef = useRef(0); // [0..1] target sink amount
    const sinkAnimRef = useRef(0); // valore animato
    const [splashes, setSplashes] = useState([]);

    // Reset all'avvio
    useEffect(() => {
        if (status === 'playing' && phase === 'aim') {
            flightRef.current = null;
            baseBobberPosRef.current = null;
            fishingState.bobberPos = null;
            fishingState.bobberSink = 0;
            sinkRef.current = 0;
            sinkAnimRef.current = 0;
        }
    }, [status, phase]);

    // Quando passa in 'bite' o torna in 'waiting' aggiorno target sink
    useEffect(() => {
        if (phase === 'bite' || phase === 'hooked' || phase === 'reeling') {
            sinkRef.current = SINK_DEPTH;
        } else {
            sinkRef.current = 0;
        }
    }, [phase]);

    useFrame(({ clock }, delta) => {
        if (status !== 'playing') return;

        // === Animazione volo galleggiante ===
        if (phase === 'flight' && flightRef.current) {
            const { start, target, t0 } = flightRef.current;
            const now = clock.getElapsedTime();
            const k = Math.min((now - t0) / FLIGHT_DURATION, 1);
            const x = start[0] + (target[0] - start[0]) * k;
            const z = start[2] + (target[2] - start[2]) * k;
            const yLin = start[1] + (target[1] - start[1]) * k;
            const y = yLin + FLIGHT_ARC * 4 * k * (1 - k);
            if (bobberRef.current) {
                bobberRef.current.position.set(x, y, z);
                bobberRef.current.visible = true;
            }
            fishingState.bobberPos = [x, y, z];
            if (k >= 1) {
                // Splash + entra in waiting
                setSplashes((prev) => [
                    ...prev,
                    {
                        id: ++_splashId,
                        position: [target[0], WATER_Y, target[2]],
                    },
                ]);
                baseBobberPosRef.current = [target[0], WATER_Y, target[2]];
                flightRef.current = null;
                setPhase('waiting');
            }
            return;
        }

        // === Galleggiante in acqua (waiting/bite/hooked/reeling) ===
        if (
            baseBobberPosRef.current &&
            (phase === 'waiting' ||
                phase === 'bite' ||
                phase === 'hooked' ||
                phase === 'reeling')
        ) {
            const t = clock.getElapsedTime();
            const [bx0, by0, bz0] = baseBobberPosRef.current;

            // Sink animato verso target
            sinkAnimRef.current +=
                (sinkRef.current - sinkAnimRef.current) *
                Math.min(1, delta * 8);

            let bx = bx0;
            let by = by0;
            let bz = bz0;

            if (phase === 'waiting') {
                by += Math.sin(t * 1.6) * 0.05;
                bx += Math.sin(t * 0.7) * 0.08;
                bz += Math.cos(t * 0.5) * 0.08;
            } else if (phase === 'bite') {
                // Affonda + scuote
                by -= sinkAnimRef.current + Math.abs(Math.sin(t * 22)) * 0.08;
                bx += Math.sin(t * 25) * 0.06;
                bz += Math.cos(t * 20) * 0.06;
            } else if (phase === 'hooked' || phase === 'reeling') {
                // Galleggiante torna verso la riva man mano che progredisci
                const fg = useStore.getState().fishingGame;
                const progress =
                    fg.pullsTotal > 0 ? 1 - fg.pullsLeft / fg.pullsTotal : 0;
                // Interpola posizione bobber verso il player
                const px = playerState.x;
                const pz = playerState.z;
                bx = bx0 + (px - bx0) * progress * 0.85;
                bz = bz0 + (pz - bz0) * progress * 0.85;
                by = by0 - sinkAnimRef.current * 0.6 + Math.sin(t * 14) * 0.12;
                bx += Math.sin(t * 9) * 0.15;
                bz += Math.cos(t * 9) * 0.15;
            }

            if (bobberRef.current) {
                bobberRef.current.position.set(bx, by, bz);
                bobberRef.current.visible = true;
            }
            fishingState.bobberPos = [bx, by, bz];
            fishingState.bobberSink = sinkAnimRef.current;
            return;
        }

        // Altrimenti nascondi bobber
        if (bobberRef.current) bobberRef.current.visible = false;
        fishingState.bobberPos = null;
    });

    const handlePlaneClick = (e) => {
        if (status !== 'playing') return;
        const ph = useStore.getState().fishingGame.phase;
        if (ph !== 'aim') return;
        e.stopPropagation();

        const target = [e.point.x, WATER_Y, e.point.z];
        // Verifica distanza dal player
        const dx = target[0] - playerState.x;
        const dz = target[2] - playerState.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < MIN_CAST) return;
        // Verifica che il bersaglio sia almeno MIN_FORWARD davanti al player
        const fwdX = Math.sin(playerState.rotY);
        const fwdZ = Math.cos(playerState.rotY);
        const forward = dx * fwdX + dz * fwdZ;
        if (forward < MIN_FORWARD) return;
        if (dist > MAX_CAST) {
            // Limita il lancio
            const k = MAX_CAST / dist;
            target[0] = playerState.x + dx * k;
            target[2] = playerState.z + dz * k;
        }

        // Punto di partenza: davanti al player a 0.8m + altezza canna
        const dirLen = Math.sqrt(dx * dx + dz * dz) || 1;
        const start = [
            playerState.x + (dx / dirLen) * 0.8,
            playerState.y + 1.6,
            playerState.z + (dz / dirLen) * 0.8,
        ];
        flightRef.current = {
            start,
            target,
            t0: 0, // verrà settato al prossimo frame in useFrame
        };
        // Workaround: settiamo t0 reale qui
        flightRef.current.t0 = performance.now() / 1000; // approssimato
        // Cleaner: usiamo useRef interno per allinearci a clock.getElapsedTime
        // Lo fixiamo dentro useFrame con un piccolo trucco:
        flightRef.current._needT0 = true;

        setPhase('flight');
    };

    // Fix: allinea t0 con clock.getElapsedTime al primo frame di flight
    useFrame(({ clock }) => {
        if (flightRef.current && flightRef.current._needT0) {
            flightRef.current.t0 = clock.getElapsedTime();
            flightRef.current._needT0 = false;
        }
    });

    if (status !== 'playing') return null;

    return (
        <group>
            {/* Plane invisibile per click sull'oceano */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, WATER_Y + 0.05, 0]}
                onClick={handlePlaneClick}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <planeGeometry args={[200, 200]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* Galleggiante: sfera bianca/rossa */}
            <group ref={bobberRef} visible={false}>
                <mesh castShadow>
                    <sphereGeometry args={[0.18, 14, 10]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Cappuccio rosso superiore */}
                <mesh position={[0, 0.04, 0]} scale={[1.01, 0.55, 1.01]}>
                    <sphereGeometry
                        args={[0.18, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]}
                    />
                    <meshStandardMaterial
                        color="#dd2233"
                        emissive="#660000"
                        emissiveIntensity={0.2}
                    />
                </mesh>
            </group>

            {splashes.map((sp) => (
                <Splash
                    key={sp.id}
                    position={sp.position}
                    onDone={() =>
                        setSplashes((prev) =>
                            prev.filter((x) => x.id !== sp.id),
                        )
                    }
                />
            ))}
        </group>
    );
}
