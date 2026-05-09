import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
    BufferGeometry,
    Float32BufferAttribute,
    LineBasicMaterial,
    Line,
    Vector3,
} from 'three';
import { fishingState } from './fishingState';
import { playerState } from './playerState';

const HAND_OFFSET = { x: 0.35, y: 0.55, z: 0.4 };
const ROD_LENGTH = 1.6;

const _v3 = new Vector3();

export function FishingRod() {
    const rodGroupRef = useRef();
    const rodTipRef = useRef();
    const lineRef = useRef();

    const lineGeo = useMemo(() => {
        const g = new BufferGeometry();
        g.setAttribute(
            'position',
            new Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3),
        );
        return g;
    }, []);
    const lineMat = useMemo(
        () =>
            new LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.85,
            }),
        [],
    );
    const line = useMemo(() => new Line(lineGeo, lineMat), [lineGeo, lineMat]);

    useFrame(({ clock }) => {
        const visible = !!fishingState.active;
        if (rodGroupRef.current) rodGroupRef.current.visible = visible;
        if (lineRef.current) lineRef.current.visible = false;
        if (!visible) return;

        const phase = fishingState.phase;
        const rotY = playerState.rotY;
        const t = clock.getElapsedTime();

        // Posizione canna nella mano del player
        const ox = HAND_OFFSET.x;
        const oz = HAND_OFFSET.z;
        const wx = ox * Math.cos(rotY) + oz * Math.sin(rotY);
        const wz = -ox * Math.sin(rotY) + oz * Math.cos(rotY);
        rodGroupRef.current.position.set(
            playerState.x + wx,
            playerState.y + HAND_OFFSET.y,
            playerState.z + wz,
        );

        // Inclinazione canna in base alla fase
        let pitch = -0.6;
        if (phase === 'aim') pitch = -0.4 + Math.sin(t * 1.5) * 0.05;
        else if (phase === 'flight') pitch = -0.2;
        else if (phase === 'bite') pitch = -0.6 + Math.sin(t * 22) * 0.08;
        else if (phase === 'hooked' || phase === 'reeling')
            pitch = -0.85 + Math.sin(t * 18) * 0.12;

        rodGroupRef.current.rotation.set(pitch, rotY, 0);

        // Lenza dalla punta canna al galleggiante
        if (rodTipRef.current && lineRef.current) {
            rodTipRef.current.getWorldPosition(_v3);
            const positions = lineGeo.attributes.position.array;
            positions[0] = _v3.x;
            positions[1] = _v3.y;
            positions[2] = _v3.z;
            const bp = fishingState.bobberPos;
            if (bp) {
                positions[3] = bp[0];
                positions[4] = bp[1];
                positions[5] = bp[2];
                lineRef.current.visible = true;
            } else {
                positions[3] = _v3.x;
                positions[4] = _v3.y;
                positions[5] = _v3.z;
            }
            lineGeo.attributes.position.needsUpdate = true;
        }
    });

    return (
        <>
            <group ref={rodGroupRef} visible={false}>
                <mesh
                    position={[0, 0, ROD_LENGTH / 2]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <cylinderGeometry args={[0.025, 0.06, ROD_LENGTH, 8]} />
                    <meshStandardMaterial color="#5d3a1a" roughness={0.7} />
                </mesh>
                <object3D ref={rodTipRef} position={[0, 0, ROD_LENGTH]} />
            </group>
            <primitive ref={lineRef} object={line} />
        </>
    );
}
