import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from './useStore';
import { playerState } from './playerState';

const WATER_Y = 0.9;
// Anello di spawn vicino alla riva (raggio approssimativo isola = 100m,
// ma quasi-piatto/sabbia già a 70-100). Spawn nell'oceano vicino, validato
// con terrainHeight per evitare di finire su sabbia/erba.
const SPAWN_INNER = 55;
const SPAWN_OUTER = 75;
// Distanza minima dal player
const MIN_PLAYER_DIST = 10;

// Replica esatta della formula di CoastalTerrain per sapere se un punto
// (x, z) cade su terra (h > waterLevel) o in acqua.
function terrainHeight(x, z) {
    const radius = 100;
    const d = Math.sqrt(x * x + z * z);
    if (d < radius * 0.7) {
        const cf = 1 - d / (radius * 0.7);
        let h = Math.pow(cf, 1.5) * 6.0;
        const nX = Math.sin(x * 0.15) * Math.cos(z * 0.15);
        const nY = Math.cos(x * 0.12) * Math.sin(z * 0.18);
        h += (nX + nY) * 0.3;
        return h;
    }
    if (d < radius) {
        const bf = 1 - (d - radius * 0.7) / (radius * 0.3);
        return bf * 0.5;
    }
    return 0;
}
const NUM_COCONUTS = 6;
const HIT_RADIUS = 1.6;
const STONE_DURATION = 1.0; // secondi di volo
const COMBO_WINDOW = 4.0;

// === FX SUONO ===
let audioCtx;
function playWhoosh() {
    try {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(420, t);
        o.frequency.exponentialRampToValueAtTime(120, t + 0.3);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + 0.34);
    } catch {}
}

function playHit() {
    try {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(660, t);
        o.frequency.exponentialRampToValueAtTime(220, t + 0.18);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + 0.27);
    } catch {}
}

// Genera una posizione random, validata: deve essere in acqua e abbastanza
// lontana dal player. Tenta fino a 30 volte, fallback su anello esterno.
function randomOceanPos() {
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = SPAWN_INNER + Math.random() * (SPAWN_OUTER - SPAWN_INNER);
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        // Deve essere in acqua (terreno sotto il pelo dell'acqua)
        if (terrainHeight(x, z) > WATER_Y - 0.1) continue;
        // Distanza minima dal player
        const dxp = x - playerState.x;
        const dzp = z - playerState.z;
        if (dxp * dxp + dzp * dzp < MIN_PLAYER_DIST * MIN_PLAYER_DIST) continue;
        return [x, WATER_Y, z];
    }
    // Fallback: anello esterno garantito acqua
    const a = Math.random() * Math.PI * 2;
    return [Math.cos(a) * SPAWN_OUTER, WATER_Y, Math.sin(a) * SPAWN_OUTER];
}

function Coconut({ id, position, onHit, hidden }) {
    const ref = useRef();
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = clock.getElapsedTime();
        // Bobbing onde
        ref.current.position.y = position[1] + Math.sin(t * 1.2 + id) * 0.18;
        ref.current.rotation.y = t * 0.4 + id;
        ref.current.rotation.z = Math.sin(t * 0.8 + id) * 0.2;
    });
    if (hidden) return null;
    return (
        <group ref={ref} position={position}>
            <mesh castShadow>
                <sphereGeometry args={[0.4, 12, 10]} />
                <meshStandardMaterial color="#5a3010" roughness={0.85} />
            </mesh>
            {/* Ciuffo verde sopra */}
            <mesh position={[0, 0.4, 0]}>
                <coneGeometry args={[0.18, 0.3, 6]} />
                <meshStandardMaterial color="#7ab040" roughness={0.7} />
            </mesh>
        </group>
    );
}

function Stone({ start, target, onLand }) {
    const ref = useRef();
    const t0Ref = useRef(null);
    const landedRef = useRef(false);
    // Durata costante, arco modesto: lanci brevi e leggibili
    const duration = 1.0;
    const arc = 4;
    useFrame(({ clock }) => {
        if (!ref.current || landedRef.current) return;
        const now = clock.getElapsedTime();
        if (t0Ref.current === null) t0Ref.current = now;
        const elapsed = now - t0Ref.current;
        const k = Math.min(elapsed / duration, 1);
        const x = start[0] + (target[0] - start[0]) * k;
        const z = start[2] + (target[2] - start[2]) * k;
        const yLin = start[1] + (target[1] - start[1]) * k;
        const y = yLin + arc * 4 * k * (1 - k);
        ref.current.position.set(x, y, z);
        ref.current.rotation.x = elapsed * 8;
        ref.current.rotation.z = elapsed * 6;
        if (k >= 1) {
            landedRef.current = true;
            onLand([x, y, z]);
        }
    });
    return (
        <mesh ref={ref} castShadow position={start}>
            <icosahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
    );
}

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

let _coconutId = 0;
let _stoneId = 0;
let _splashId = 0;

export function CoconutGame() {
    const status = useStore((s) => s.coconutGame.status);
    const tick = useStore.getState().tickCoconutGame;
    const addHit = useStore.getState().addCoconutHit;
    const resetCombo = useStore.getState().resetCoconutCombo;

    const [coconuts, setCoconuts] = useState(() =>
        Array.from({ length: NUM_COCONUTS }, () => ({
            id: ++_coconutId,
            position: randomOceanPos(),
            hidden: false,
        })),
    );
    const [stones, setStones] = useState([]);
    const [splashes, setSplashes] = useState([]);
    const lastHitRef = useRef(0);

    // Reset quando il game riparte
    useEffect(() => {
        if (status === 'playing') {
            setCoconuts(
                Array.from({ length: NUM_COCONUTS }, () => ({
                    id: ++_coconutId,
                    position: randomOceanPos(),
                    hidden: false,
                })),
            );
            setStones([]);
            setSplashes([]);
            lastHitRef.current = 0;
        }
    }, [status]);

    useFrame((_, delta) => {
        if (useStore.getState().coconutGame.status === 'playing') {
            tick(delta);
        }
    });

    const handlePlaneClick = (e) => {
        if (useStore.getState().coconutGame.status !== 'playing') return;
        e.stopPropagation();
        const target = [e.point.x, WATER_Y, e.point.z];
        // Spawn del sasso poco sopra al player, leggermente offsettato
        // verso il target ("davanti" alle mani) per visual feedback corretto
        const dx = target[0] - playerState.x;
        const dz = target[2] - playerState.z;
        const dist = Math.sqrt(dx * dx + dz * dz) || 1;
        const offset = 0.8;
        const start = [
            playerState.x + (dx / dist) * offset,
            playerState.y + 1.4,
            playerState.z + (dz / dist) * offset,
        ];
        const id = ++_stoneId;
        setStones((prev) => [...prev, { id, start, target }]);
        playWhoosh();
    };

    const handleStoneLand = (stoneId, landingPos) => {
        // Cerca cocco entro HIT_RADIUS
        const now = performance.now() / 1000;
        let hitIdx = -1;
        for (let i = 0; i < coconuts.length; i++) {
            const c = coconuts[i];
            if (c.hidden) continue;
            const dx = c.position[0] - landingPos[0];
            const dz = c.position[2] - landingPos[2];
            if (dx * dx + dz * dz < HIT_RADIUS * HIT_RADIUS) {
                hitIdx = i;
                break;
            }
        }
        if (hitIdx >= 0) {
            const hitCoconutPos = coconuts[hitIdx].position;
            // Splash al punto del cocco colpito
            setSplashes((prev) => [
                ...prev,
                { id: ++_splashId, position: hitCoconutPos },
            ]);
            // Hide il cocco e respawn dopo 2s in nuova posizione
            setCoconuts((prev) =>
                prev.map((c, i) => (i === hitIdx ? { ...c, hidden: true } : c)),
            );
            setTimeout(() => {
                setCoconuts((prev) =>
                    prev.map((c, i) =>
                        i === hitIdx
                            ? {
                                  id: ++_coconutId,
                                  position: randomOceanPos(),
                                  hidden: false,
                              }
                            : c,
                    ),
                );
            }, 2000);
            // Combo: se entro finestra mantieni, altrimenti reset
            if (now - lastHitRef.current > COMBO_WINDOW) resetCombo();
            lastHitRef.current = now;
            addHit();
            playHit();
        } else {
            // Splash piccolo dove è caduto
            setSplashes((prev) => [
                ...prev,
                {
                    id: ++_splashId,
                    position: [landingPos[0], WATER_Y, landingPos[2]],
                },
            ]);
        }
        // Rimuovi sasso
        setStones((prev) => prev.filter((s) => s.id !== stoneId));
    };

    if (status !== 'playing') return null;

    return (
        <group>
            {/* Plane invisibile per raycasting click sull'oceano */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, WATER_Y + 0.05, 0]}
                onClick={handlePlaneClick}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <planeGeometry args={[200, 200]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {coconuts.map((c) => (
                <Coconut
                    key={c.id}
                    id={c.id}
                    position={c.position}
                    hidden={c.hidden}
                />
            ))}

            {stones.map((s) => (
                <Stone
                    key={s.id}
                    start={s.start}
                    target={s.target}
                    onLand={(pos) => handleStoneLand(s.id, pos)}
                />
            ))}

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
