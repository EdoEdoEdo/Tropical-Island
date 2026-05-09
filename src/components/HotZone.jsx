import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { useStore } from './useStore';
import { playerState } from './playerState';

// Registro globale: tutti gli HotZone montati condividono questa lista
// così possiamo decidere ad ogni frame quale è "il vincitore" (il più vicino
// entro la sua revealDistance) ed evitare che pin si accavallino.
const hotzoneRegistry = new Set();

/**
 * HotZone con proximity reveal:
 *  - Pallino sempre visibile (piccolo, opaco)
 *  - Quando il player è entro `revealDistance` mostra l'etichetta "Press E"
 *  - Click sul marker o tasto E ravvicinati apre il modale
 *  - Se più HotZone si sovrappongono, attivo solo quella più vicina
 */
export function HotZone({
    position,
    modal,
    label = 'Interagisci',
    revealDistance = 8,
    markerOffset = [0, 2.5, 0],
}) {
    const openModal = useStore((s) => s.openModal);
    const modalOpen = useStore((s) => s.modal);
    const [near, setNear] = useState(false);
    const [hovered, setHovered] = useState(false);
    const nearRef = useRef(false);
    const entryRef = useRef({
        position,
        revealDistance,
        dist: Infinity,
    });

    // Mantieni i valori aggiornati nell'entry condiviso
    entryRef.current.position = position;
    entryRef.current.revealDistance = revealDistance;

    useEffect(() => {
        const entry = entryRef.current;
        hotzoneRegistry.add(entry);
        return () => {
            hotzoneRegistry.delete(entry);
        };
    }, []);

    useFrame(() => {
        const dx = playerState.x - position[0];
        const dz = playerState.z - position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        entryRef.current.dist = dist;

        // Trova il vincitore tra tutte le hotzone in range
        let winner = null;
        let winnerDist = Infinity;
        hotzoneRegistry.forEach((e) => {
            if (e.dist < e.revealDistance && e.dist < winnerDist) {
                winner = e;
                winnerDist = e.dist;
            }
        });
        const isNear = winner === entryRef.current;

        if (isNear !== nearRef.current) {
            nearRef.current = isNear;
            setNear(isNear);
        }

        // Tasto E quando vicino (e vincitore) e nessun modale aperto
        if (isNear && !modalOpen && pressedE.current) {
            pressedE.current = false;
            openModal(modal);
        }
    });

    const handleActivate = (e) => {
        e?.stopPropagation();
        // Apri il modale solo se questo è il pin "vincitore" (vicino).
        // Così marker non vincenti restano dot innocui anche se cliccati.
        if (!nearRef.current) return;
        openModal(modal);
    };

    return (
        <group position={position}>
            <Html
                position={markerOffset}
                center
                distanceFactor={near ? 10 : 18}
                style={{ pointerEvents: 'auto' }}
            >
                <button
                    type="button"
                    onClick={handleActivate}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    aria-label={label}
                    className={`hotzone-marker ${near ? 'near' : ''} ${hovered ? 'hovered' : ''}`}
                >
                    <span className="hotzone-dot" />
                    {near && (
                        <>
                            <span className="hotzone-label">{label}</span>
                            <span className="hotzone-key">E</span>
                        </>
                    )}
                </button>
            </Html>
        </group>
    );
}

// Listener globale tasto E (montato una sola volta)
const pressedE = { current: false };
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyE') pressedE.current = true;
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyE') pressedE.current = false;
    });
}
