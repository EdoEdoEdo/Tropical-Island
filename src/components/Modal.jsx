import { useEffect } from 'react';
import { useStore } from './useStore';
import { playerState } from './playerState';

/**
 * Modale HTML reso fuori dal Canvas.
 * Contenuto cambia in base a `modal` store: cinema | info | moai | house |
 * bonfire | water | parrot.
 */
export function Modal() {
    const modal = useStore((s) => s.modal);
    const closeModal = useStore((s) => s.closeModal);

    useEffect(() => {
        if (!modal) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modal, closeModal]);

    if (!modal) return null;

    return (
        <div onClick={closeModal} style={overlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
                <button
                    onClick={closeModal}
                    aria-label="Chiudi"
                    style={closeBtnStyle}
                >
                    ×
                </button>

                {modal === 'cinema' && <CinemaContent />}
                {modal === 'info' && <InfoContent />}
                {modal === 'moai' && <MoaiContent />}
                {modal === 'house' && <HouseContent />}
                {modal === 'bonfire' && <BonfireContent />}
                {modal === 'water' && <WaterContent />}
                {modal === 'parrot' && <ParrotContent />}
                {modal === 'turtle' && <TurtleContent />}
                {modal === 'surf' && <SurfContent />}
                {modal === 'fishing' && <FishingContent />}
            </div>
        </div>
    );
}

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
    animation: 'fadeIn 0.25s ease',
};

const cardStyle = {
    background: '#1a1a2e',
    color: '#fff',
    borderRadius: '16px',
    maxWidth: 720,
    width: '100%',
    maxHeight: '85vh',
    overflow: 'auto',
    padding: '2rem',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    position: 'relative',
};

const closeBtnStyle = {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
};

function TechSection({ title, items }) {
    return (
        <ul style={{ lineHeight: 1.7, paddingLeft: '1.2rem' }}>
            {items.map((it, i) => (
                <li key={i}>{it}</li>
            ))}
        </ul>
    );
}

function CinemaContent() {
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🎬 Cinema sull'isola</h2>
            <video
                src="video/video_small.mp4"
                controls
                autoPlay
                loop
                style={{ width: '100%', borderRadius: 8 }}
            />
            <h3>Come è fatto</h3>
            <TechSection
                items={[
                    'Video MP4 mappato come VideoTexture su un mesh planare',
                    'Cornice in legno modellata in Blender ed esportata GLB',
                    'PostFX Bloom esalta i colori del video proiettato',
                ]}
            />
        </>
    );
}

function InfoContent() {
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🏝️ Tropical Island — Info</h2>
            <p>
                Esercizio di stile in <strong>React Three Fiber</strong>: scena
                3D interattiva con ciclo giorno/notte, fisica, particelle e
                shader custom. Tutto open-source.
            </p>
            <h3>Comandi</h3>
            <TechSection
                items={[
                    'WASD / frecce: muoviti',
                    'Spazio: salta',
                    'E (vicino a un POI): interagisci',
                    'Mobile: joystick + tasto salto',
                    'Pannello in alto a destra: cambia ora del giorno, FX, audio',
                ]}
            />
            <h3>Stack</h3>
            <TechSection
                items={[
                    'React 18 + Vite + R3F + drei',
                    '@react-three/rapier (physics)',
                    '@react-three/postprocessing (bloom, vignette)',
                    'Zustand (state)',
                    'gltf-transform (compressione modelli -76%)',
                ]}
            />
            <p style={{ opacity: 0.7, marginTop: 16 }}>
                Made by{' '}
                <a
                    href="https://www.edoedoedo.it"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#ff9966' }}
                >
                    Edoardo
                </a>
                {' · '}
                <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#ff9966' }}
                >
                    GitHub
                </a>
            </p>
        </>
    );
}

function MoaiContent() {
    const startOrbHunt = useStore((s) => s.startOrbHunt);
    const closeModal = useStore((s) => s.closeModal);
    const bestTime = useStore((s) => s.orbHunt.bestTime);
    const handleStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Chiudi il modal e poi avvia il game al prossimo tick
        // (evita race con eventi di click in arrivo)
        closeModal();
        requestAnimationFrame(() => startOrbHunt());
    };
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🗿 Il Moai parla</h2>
            <p>
                "Viaggiatore, l'isola nasconde{' '}
                <strong>12 sfere luminose</strong>. Trovale tutte in 3 minuti se
                vuoi guadagnarti il mio rispetto."
            </p>
            {bestTime !== null && (
                <p style={{ opacity: 0.7 }}>
                    🏆 Il tuo miglior tempo: {Math.floor(bestTime / 60)}:
                    {String(bestTime % 60).padStart(2, '0')}
                </p>
            )}
            <button
                type="button"
                onClick={handleStart}
                style={{
                    background: '#ff9966',
                    border: 'none',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginTop: 8,
                }}
            >
                ⚡ Inizia la caccia alle sfere
            </button>

            <h3 style={{ marginTop: 24 }}>Tech del modello</h3>
            <TechSection
                items={[
                    'GLB ottimizzato con Meshopt: 165 KB → 21 KB (-87%)',
                    'CuboidCollider semplificato, no convex-hull (più stabile)',
                    'Texture compresse in WebP',
                ]}
            />
        </>
    );
}

function HouseContent() {
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🏠 La cabina</h2>
            <p>
                Una semplice cabina in legno con tetto rosso. Niente di
                particolare dentro, ma il modello dimostra come gestire i{' '}
                <strong>collider semplificati</strong> per oggetti complessi.
            </p>
            <h3>Tech</h3>
            <TechSection
                items={[
                    'Cabin.glb compresso da 272 KB a 71 KB (-74%)',
                    'CuboidCollider unico al posto di trimesh (più veloce, niente bug fisici)',
                    'castShadow + receiveShadow su tutti i mesh figli',
                ]}
            />
        </>
    );
}

function BonfireContent() {
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🔥 Falò</h2>
            <p>
                Un fuoco crepitante con fumo, scintille e audio 3D posizionale.
                Ti scaldi a distanza grazie alla pointLight con decay.
            </p>
            <h3>Tech</h3>
            <TechSection
                items={[
                    'BonfireFX: 2 particle system custom (smoke con NormalBlending, sparks con Additive + gravità negativa)',
                    'PositionalAudio drei: il volume scala con la distanza',
                    'pointLight color #ffa07a, distance 50, decay 2',
                ]}
            />
        </>
    );
}

function WaterContent() {
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🌊 L'oceano</h2>
            <p>
                L'acqua usa uno shader stilizzato custom con caustics, foam
                animata e <strong>fake reflection</strong> del cielo (zero
                render-pass extra).
            </p>
            <h3>Pipeline shader</h3>
            <TechSection
                items={[
                    'Perlin noise simplex per pattern di onde',
                    'Caustics in shallow water (mask sul gradient profondità)',
                    'Foam animata via threshold dinamico',
                    'Sky reflection: sample del gradient cielo lungo la direzione riflessa',
                    'Sun glint: doppio lobo Phong attorno a sunDir',
                    'Fresnel pow(1-viewDir.y, 4) per intensità riflesso a grazing angle',
                    'Horizon fade: smoothstep del raggio UV verso il colore cielo',
                ]}
            />
        </>
    );
}

function ParrotContent() {
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🦜 Il pappagallo</h2>
            <p>
                Vola in cerchio sopra l'isola con altitudine variabile. Nessuna
                AI complessa: solo trigonometria in <code>useFrame</code>.
            </p>
            <h3>Codice</h3>
            <pre
                style={{
                    background: '#0d0d1f',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    fontSize: 12,
                    lineHeight: 1.5,
                }}
            >{`useFrame(({ clock }) => {
  const t = clock.getElapsedTime() * speed;
  group.position.x = Math.cos(t) * radius;
  group.position.z = Math.sin(t) * radius;
  group.position.y = height + Math.sin(t * 2) * 1.5;
  group.rotation.y = -t + Math.PI;
});`}</pre>
            <p style={{ opacity: 0.7 }}>
                Stesso pattern usato per la tartaruga (raggio maggiore, sopra
                l'acqua) e i granchi (con waypoint random + flee dal player).
            </p>
        </>
    );
}

function TurtleContent() {
    const startCoconutGame = useStore((s) => s.startCoconutGame);
    const closeModal = useStore((s) => s.closeModal);
    const bestScore = useStore((s) => s.coconutGame.bestScore);
    const handleStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeModal();
        requestAnimationFrame(() => startCoconutGame());
    };
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🐢 La Tartaruga propone</h2>
            <p>
                "Vedi quei cocchi che galleggiano nell'oceano? Lanciagli un
                sasso!
                <strong> Hai 2 minuti</strong> per centrarne più che puoi. Combo
                se colpisci più cocchi di fila!"
            </p>
            {bestScore > 0 && (
                <p style={{ opacity: 0.7 }}>
                    🏆 Miglior punteggio: {bestScore}
                </p>
            )}
            <button
                type="button"
                onClick={handleStart}
                style={{
                    background: '#ff9966',
                    border: 'none',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginTop: 8,
                }}
            >
                🥥 Lancia il sasso
            </button>

            <h3 style={{ marginTop: 24 }}>Tech del gioco</h3>
            <TechSection
                items={[
                    'Raycast su un plane invisibile a livello del mare per intercettare il click/tap',
                    'Traiettoria parabolica del sasso calcolata in JS (no Rapier per il proiettile)',
                    'Audio sintetizzato in WebAudio (whoosh + hit), zero asset esterni',
                    "Cocchi con bobbing trigonometrico, respawn random nell'anello oceanico",
                ]}
            />
        </>
    );
}

function SurfContent() {
    const startSurfGame = useStore((s) => s.startSurfGame);
    const closeModal = useStore((s) => s.closeModal);
    const bestScore = useStore((s) => s.surfGame.bestScore);
    const handleStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Salva la posizione corrente del player per restore a fine partita
        const savedPos = [playerState.x, playerState.y, playerState.z];
        const savedRotY = playerState.rotY;
        closeModal();
        requestAnimationFrame(() => startSurfGame(savedPos, savedRotY));
    };
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🏄 Surf Challenge</h2>
            <p>
                Sali sulla tavola e mantieni l'equilibrio il più a lungo
                possibile! L'onda ti sbilancia, tu controbilanci con i tasti.
            </p>
            <ul style={{ lineHeight: 1.7 }}>
                <li>
                    <strong>A / D</strong> o <strong>◀ / ▶</strong>: inclina la
                    tavola
                </li>
                <li>
                    <strong>Mobile</strong>: tocca i lati dello schermo
                </li>
                <li>
                    Stai dentro la zona safe — la difficoltà cresce nel tempo
                </li>
            </ul>
            {bestScore > 0 && (
                <p style={{ opacity: 0.7 }}>🏆 Miglior tempo: {bestScore}s</p>
            )}
            <button
                type="button"
                onClick={handleStart}
                style={{
                    background: '#ff9966',
                    border: 'none',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginTop: 8,
                }}
            >
                🏄 Sali sulla tavola
            </button>

            <h3 style={{ marginTop: 24 }}>Tech del gioco</h3>
            <TechSection
                items={[
                    'Sistema fisico semplificato 1D: tilt come random-walk + input + damping',
                    'Game-loop in requestAnimationFrame indipendente da useFrame R3F',
                    "Difficoltà adattiva: la potenza dell'onda cresce con il tempo",
                    'UI overlay HTML/CSS, zero asset, mobile-first con tap-zone laterali',
                ]}
            />
        </>
    );
}

function FishingContent() {
    const startFishingGame = useStore((s) => s.startFishingGame);
    const closeModal = useStore((s) => s.closeModal);
    const bestScore = useStore((s) => s.fishingGame.bestScore);
    const handleStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const savedPos = [playerState.x, playerState.y, playerState.z];
        const savedRotY = playerState.rotY;
        closeModal();
        requestAnimationFrame(() => startFishingGame(savedPos, savedRotY));
    };
    return (
        <>
            <h2 style={{ marginTop: 0 }}>🎣 Pesca dalla riva</h2>
            <p>
                Lancia l'esca nel mare, aspetta che il galleggiante affondi,
                aggancia il pesce al volo e ritiralo a riva. Più punti possibili
                in 90s!
            </p>
            <ul style={{ lineHeight: 1.7 }}>
                <li>
                    <strong>Click / tap</strong> sul mare: lancia l'esca
                </li>
                <li>
                    Quando il galleggiante affonda, premi
                    <strong> SPAZIO</strong> o tocca <strong>AGGANCIA</strong>{' '}
                    al volo
                </li>
                <li>
                    Tap ripetuti su <strong>TIRA!</strong> per ritirare il pesce
                    prima che spezzi la lenza
                </li>
                <li>Pesci più rari = più punti, ma più tap necessari</li>
            </ul>
            {bestScore > 0 && (
                <p style={{ opacity: 0.7 }}>
                    🏆 Miglior punteggio: {bestScore} pt
                </p>
            )}
            <button
                type="button"
                onClick={handleStart}
                style={{
                    background: '#3399ff',
                    border: 'none',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginTop: 8,
                }}
            >
                🎣 Vai a pescare
            </button>

            <h3 style={{ marginTop: 24 }}>Tech del gioco</h3>
            <TechSection
                items={[
                    'Macchina a stati: aim → flight → waiting → bite → reeling → caught/lost',
                    'Click sul mesh oceano (raycast R3F) per puntare il lancio, traiettoria parabolica',
                    'Galleggiante 3D che galleggia/affonda in base alla fase, lenza Three.Line dinamica',
                    'Drop table pesata per rarità: 4 tier, 8 specie, mash count scalato per difficoltà',
                    'WebAudio FX procedurali (splash, bite, reel-tick, catch, snap)',
                ]}
            />
        </>
    );
}
