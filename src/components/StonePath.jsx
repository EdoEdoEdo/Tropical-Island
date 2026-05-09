import { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import { terrainHeight } from './terrainHeight';

/**
 * Sentiero di pietre poligonali piatte:
 *  - Cerchio centrale (raggio CENTER_RADIUS)
 *  - 4 strade radiali N/S/E/W con lunghezze diverse
 *  - Pietre molto basse (calpestabili) con CylinderCollider
 */

const CENTER_RADIUS = 3.2;
const STONES_PER_RING = 12;
const PATH_STEP = 1.6;
const PATH_WIDTH_OFFSET = 0.5;
const STONE_HEIGHT = 0.18;
const STONE_TOP_OFFSET = 0.06; // sporgenza sopra il terreno (bassa = calpestabile)

// Lunghezze per direzione (E=+X bonfire, W=-X casa, N=+Z cinema, S=-Z moai)
const PATH_LENGTHS = {
    east: 18.8, // verso bonfire (+3 pietre)
    west: 18.8, // verso casa (+3 pietre)
    north: 12.5, // verso cinema
    south: 15.7, // verso moai (+2 pietre)
};

function buildStones() {
    const stones = [];
    const rng = mulberry32(1337);

    // Cerchio centrale
    for (let i = 0; i < STONES_PER_RING; i++) {
        const a = (i / STONES_PER_RING) * Math.PI * 2;
        const x = Math.cos(a) * CENTER_RADIUS;
        const z = Math.sin(a) * CENTER_RADIUS;
        stones.push({
            x: x + (rng() - 0.5) * 0.25,
            z: z + (rng() - 0.5) * 0.25,
            scale: 0.85 + rng() * 0.35,
            rotY: rng() * Math.PI * 2,
            sides: rng() > 0.5 ? 6 : 8,
        });
    }
    // Pietra centrale grande
    stones.push({
        x: 0,
        z: 0,
        scale: 1.6,
        rotY: rng() * Math.PI * 2,
        sides: 8,
    });

    // Strade radiali
    const dirs = [
        { dx: 1, dz: 0, len: PATH_LENGTHS.east },
        { dx: -1, dz: 0, len: PATH_LENGTHS.west },
        { dx: 0, dz: 1, len: PATH_LENGTHS.north },
        { dx: 0, dz: -1, len: PATH_LENGTHS.south },
    ];
    dirs.forEach(({ dx, dz, len }) => {
        for (let r = CENTER_RADIUS + PATH_STEP; r <= len; r += PATH_STEP) {
            const perpX = -dz;
            const perpZ = dx;
            const lateral =
                ((r / PATH_STEP) % 2 === 0 ? 1 : -1) * PATH_WIDTH_OFFSET;
            stones.push({
                x: dx * r + perpX * lateral + (rng() - 0.5) * 0.3,
                z: dz * r + perpZ * lateral + (rng() - 0.5) * 0.3,
                scale: 0.75 + rng() * 0.45,
                rotY: rng() * Math.PI * 2,
                sides: rng() > 0.5 ? 6 : 8,
            });
        }
    });

    return stones;
}

function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function StonePath() {
    const { stones, geom6, geom8, mat } = useMemo(() => {
        const stones = buildStones();
        // Top fisso, base leggermente più stretta per look naturale
        const geom6 = new THREE.CylinderGeometry(1, 0.95, STONE_HEIGHT, 6);
        const geom8 = new THREE.CylinderGeometry(1, 0.95, STONE_HEIGHT, 8);
        const mat = new THREE.MeshStandardMaterial({
            color: '#8a8580',
            roughness: 0.95,
            metalness: 0,
            flatShading: true,
        });
        return { stones, geom6, geom8, mat };
    }, []);

    const six = useMemo(() => stones.filter((s) => s.sides === 6), [stones]);
    const eight = useMemo(() => stones.filter((s) => s.sides === 8), [stones]);

    return (
        <group>
            {/* Visivo: 2 InstancedMesh */}
            <StoneInstances list={six} geometry={geom6} material={mat} />
            <StoneInstances list={eight} geometry={geom8} material={mat} />

            {/* Fisica: un singolo RigidBody fisso con N collider cilindrici */}
            <RigidBody type="fixed" colliders={false} name="stone-path">
                {stones.map((s, i) => {
                    const y =
                        terrainHeight(s.x, s.z) +
                        STONE_TOP_OFFSET -
                        STONE_HEIGHT / 2;
                    return (
                        <CylinderCollider
                            key={i}
                            args={[STONE_HEIGHT / 2, s.scale * 0.95]}
                            position={[s.x, y, s.z]}
                        />
                    );
                })}
            </RigidBody>
        </group>
    );
}

function StoneInstances({ list, geometry, material }) {
    const setRef = (mesh) => {
        if (!mesh) return;
        const dummy = new THREE.Object3D();
        list.forEach((s, i) => {
            const y =
                terrainHeight(s.x, s.z) + STONE_TOP_OFFSET - STONE_HEIGHT / 2;
            dummy.position.set(s.x, y, s.z);
            dummy.rotation.set(0, s.rotY, 0);
            dummy.scale.set(s.scale, 1, s.scale);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    };

    return (
        <instancedMesh
            ref={setRef}
            args={[geometry, material, list.length]}
            castShadow={false}
            receiveShadow
        />
    );
}
