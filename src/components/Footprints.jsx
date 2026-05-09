import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { playerState } from './playerState';
import { terrainHeight } from './terrainHeight';

/**
 * Orme del personaggio sulla sabbia (zona costa).
 * MAX_PRINTS impronte visibili che svaniscono nel tempo.
 */

const MAX_PRINTS = 4;
const STEP_DISTANCE = 1.0;
const SAND_MIN_R = 45;
const WATER_LEVEL = 0.9;
const MIN_GROUND_Y = WATER_LEVEL + 0.05; // niente orme sotto al pelo dell'acqua
const FADE_TIME = 5.0;
const FOOT_SIZE = 0.7;
const FOOT_OFFSET = 0.22;
const FOOT_LIFT = 0.06;

function makeFootTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 96;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 64, 96);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.ellipse(32, 70, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(32, 38, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
        const x = 18 + i * 7;
        const y = 14 - Math.abs(i - 2) * 1.5;
        const r = i === 0 ? 4 : 3 - i * 0.3;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 4;
    return tex;
}

// Reusable scratch quaternions/vectors per evitare alloc per frame
const _qBase = new THREE.Quaternion();
const _qTilt = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    -Math.PI / 2,
);
const _yAxis = new THREE.Vector3(0, 1, 0);

export function Footprints() {
    const prints = useMemo(
        () =>
            Array.from({ length: MAX_PRINTS }, () => ({
                x: 0,
                y: -100,
                z: 0,
                rotY: 0,
                side: 1,
                age: FADE_TIME + 1,
            })),
        [],
    );

    const refs = useRef(Array.from({ length: MAX_PRINTS }, () => null));
    const cursor = useRef(0);
    const sideRef = useRef(1);
    const lastDropPos = useRef({ x: playerState.x, z: playerState.z });

    const texture = useMemo(() => makeFootTexture(), []);
    const geometry = useMemo(
        () => new THREE.PlaneGeometry(FOOT_SIZE * 0.7, FOOT_SIZE),
        [],
    );
    const materials = useMemo(
        () =>
            Array.from(
                { length: MAX_PRINTS },
                () =>
                    new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        depthWrite: false,
                        opacity: 1.0,
                        color: '#1a1108',
                        toneMapped: false,
                    }),
            ),
        [texture],
    );

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.1);

        // 1) Drop una nuova orma
        if (playerState.moving && playerState.onGround) {
            const dx = playerState.x - lastDropPos.current.x;
            const dz = playerState.z - lastDropPos.current.z;
            const distSinceLast = Math.sqrt(dx * dx + dz * dz);
            const radius = Math.sqrt(
                playerState.x * playerState.x + playerState.z * playerState.z,
            );

            if (distSinceLast > STEP_DISTANCE && radius > SAND_MIN_R) {
                const heading = playerState.rotY;
                const side = sideRef.current;
                // Perpendicolare alla heading (rotY: 0 = +Z)
                const perpX = Math.cos(heading) * side * FOOT_OFFSET;
                const perpZ = -Math.sin(heading) * side * FOOT_OFFSET;
                const px = playerState.x + perpX;
                const pz = playerState.z + perpZ;
                const ground = terrainHeight(px, pz);

                // Salta se sotto il livello dell'acqua
                if (ground >= MIN_GROUND_Y - 0.5) {
                    const py = Math.max(ground, MIN_GROUND_Y) + FOOT_LIFT;
                    const slot = prints[cursor.current];
                    slot.x = px;
                    slot.y = py;
                    slot.z = pz;
                    slot.rotY = heading;
                    slot.side = side;
                    slot.age = 0;

                    cursor.current = (cursor.current + 1) % MAX_PRINTS;
                    sideRef.current = -side;
                }
                lastDropPos.current.x = playerState.x;
                lastDropPos.current.z = playerState.z;
            }
        }

        // 2) Update transform + opacity
        for (let i = 0; i < MAX_PRINTS; i++) {
            const p = prints[i];
            const ref = refs.current[i];
            if (!ref) continue;
            p.age += dt;
            if (p.age >= FADE_TIME) {
                ref.visible = false;
                continue;
            }
            ref.visible = true;
            ref.position.set(p.x, p.y, p.z);
            // Yaw attorno a Y world × tilt -90° su X (plane → orizzontale)
            _qBase.setFromAxisAngle(_yAxis, p.rotY);
            ref.quaternion.multiplyQuaternions(_qBase, _qTilt);
            ref.scale.set(p.side === 1 ? 1 : -1, 1, 1);
            ref.material.opacity = Math.max(0, 1 - p.age / FADE_TIME);
        }
    });

    return (
        <group frustumCulled={false}>
            {Array.from({ length: MAX_PRINTS }, (_, i) => (
                <mesh
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    geometry={geometry}
                    material={materials[i]}
                    visible={false}
                    renderOrder={1}
                />
            ))}
        </group>
    );
}
