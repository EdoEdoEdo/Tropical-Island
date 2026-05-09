import { useEffect, useRef, useState } from 'react';
import { useStore } from './useStore';
import { fishingState, FISH_SHORE_POS, FISH_SHORE_ROT } from './fishingState';

const FADE_MS = 600;

// === CATALOGO PESCI ===
// pulls = quanti tap servono per ritirarlo (rarità più alta = più tap)
const FISH_POOL = [
    {
        name: 'Sardina',
        emoji: '🐟',
        rarity: 'common',
        weight: 35,
        score: 10,
        pulls: 5,
    },
    {
        name: 'Pesce tropicale',
        emoji: '🐠',
        rarity: 'common',
        weight: 30,
        score: 15,
        pulls: 7,
    },
    {
        name: 'Aragosta',
        emoji: '🦞',
        rarity: 'rare',
        weight: 12,
        score: 40,
        pulls: 10,
    },
    {
        name: 'Calamaro',
        emoji: '🦑',
        rarity: 'rare',
        weight: 10,
        score: 50,
        pulls: 12,
    },
    {
        name: 'Polpo',
        emoji: '🐙',
        rarity: 'epic',
        weight: 5,
        score: 100,
        pulls: 16,
    },
    {
        name: 'Pesce palla',
        emoji: '🐡',
        rarity: 'epic',
        weight: 4,
        score: 120,
        pulls: 18,
    },
    {
        name: 'Squalo',
        emoji: '🦈',
        rarity: 'legendary',
        weight: 1.5,
        score: 300,
        pulls: 25,
    },
    {
        name: 'Balena',
        emoji: '🐋',
        rarity: 'legendary',
        weight: 0.5,
        score: 500,
        pulls: 32,
    },
];
const RARITY_COLORS = {
    common: '#9ec5ff',
    rare: '#b07cff',
    epic: '#ff9f6b',
    legendary: '#ffd23f',
};

function rollFish() {
    const total = FISH_POOL.reduce((a, f) => a + f.weight, 0);
    let r = Math.random() * total;
    for (const f of FISH_POOL) {
        r -= f.weight;
        if (r <= 0) return f;
    }
    return FISH_POOL[0];
}

// === AUDIO FX ===
let audioCtx;
function ctx() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}
function playSplash() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(800, t);
    o.frequency.exponentialRampToValueAtTime(200, t + 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.4);
}
function playBite() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(440, t);
    o.frequency.linearRampToValueAtTime(880, t + 0.1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.25);
}
function playReel() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(1200, t);
    o.frequency.exponentialRampToValueAtTime(600, t + 0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.08);
}
function playCatch(rarity) {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const base = rarity === 'legendary' ? 660 : rarity === 'epic' ? 550 : 440;
    [0, 0.1, 0.2].forEach((dt, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(base * (1 + i * 0.25), t + dt);
        g.gain.setValueAtTime(0.0001, t + dt);
        g.gain.exponentialRampToValueAtTime(0.22, t + dt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.18);
        o.connect(g).connect(c.destination);
        o.start(t + dt);
        o.stop(t + dt + 0.2);
    });
}
function playSnap() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.4);
}

// Tempi delle fasi (s)
const WAITING_MIN = 2.0;
const WAITING_MAX = 6.0;
const BITE_WINDOW = 1.4; // tempo per agganciare
const REEL_WINDOW = 12.0; // tempo massimo per ritirare

// Tensione lenza
const TENSION_PER_TAP = 0.18; // quanto sale ogni tap
const TENSION_DECAY = 0.55; // quanto scende al secondo
const TENSION_SNAP = 1.0; // soglia rottura

export function FishingGameHUD() {
    const fg = useStore((s) => s.fishingGame);
    const setPhase = useStore((s) => s.setFishingPhase);
    const setTimeLeft = useStore((s) => s.setFishingTimeLeft);
    const setPulls = useStore((s) => s.setFishingPulls);
    const decPulls = useStore((s) => s.decFishingPulls);
    const addCatch = useStore((s) => s.addFishingCatch);
    const beginPlaying = useStore((s) => s.fishingBeginPlaying);
    const endGame = useStore((s) => s.endFishingGame);
    const fishingExit = useStore((s) => s.fishingExit);
    const fishingRetry = useStore((s) => s.fishingRetry);
    const resetGame = useStore((s) => s.resetFishingGame);

    const [fadeOpacity, setFadeOpacity] = useState(0);
    const [popup, setPopup] = useState(null);

    const currentFishRef = useRef(null);
    const phaseTimerRef = useRef(0);
    const reelTimerRef = useRef(0);
    const tensionRef = useRef(0);
    const [tensionDisplay, setTensionDisplay] = useState(0);
    const rafRef = useRef(null);
    const lastTickRef = useRef(0);

    // === FADE-IN ===
    const startedRef = useRef(false);
    useEffect(() => {
        if (
            fg.fading &&
            fg.status === 'idle' &&
            fg.savedPos &&
            !startedRef.current
        ) {
            startedRef.current = true;
            setFadeOpacity(1);
            setTimeout(() => {
                fishingState.teleportTarget = FISH_SHORE_POS;
                fishingState.teleportRotY = FISH_SHORE_ROT;
                fishingState.teleportRequested = true;
                fishingState.active = true;
                fishingState.phase = 'aim';
                fishingState.bobberPos = null;
                fishingState.bobberSink = 0;
                beginPlaying();
                setTimeout(() => setFadeOpacity(0), 100);
            }, FADE_MS);
        }
        if (fg.status !== 'idle') startedRef.current = false;
    }, [fg.fading, fg.status, fg.savedPos, beginPlaying]);

    // === FADE-OUT ===
    const endedRef = useRef(false);
    useEffect(() => {
        if (fg.status === 'ended' && fg.fading && !endedRef.current) {
            endedRef.current = true;
            setFadeOpacity(1);
            setTimeout(() => {
                if (fg.savedPos) {
                    fishingState.teleportTarget = fg.savedPos;
                    fishingState.teleportRotY = fg.savedRotY || 0;
                    fishingState.teleportRequested = true;
                }
                fishingState.active = false;
                fishingState.bobberPos = null;
                resetGame();
                setTimeout(() => setFadeOpacity(0), 200);
            }, FADE_MS);
        }
        if (fg.status !== 'ended') endedRef.current = false;
    }, [fg.status, fg.fading, fg.savedPos, fg.savedRotY, resetGame]);

    // Sync fase store → fishingState (per FishingGame/Rod)
    useEffect(() => {
        fishingState.phase = fg.phase;
    }, [fg.phase]);

    // === GAME LOOP timer + transizioni di fase ===
    useEffect(() => {
        if (fg.status !== 'playing') {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            return;
        }
        lastTickRef.current = performance.now();
        const tick = (now) => {
            const dt = Math.min(0.05, (now - lastTickRef.current) / 1000);
            lastTickRef.current = now;
            const newTimeLeft = Math.max(
                0,
                useStore.getState().fishingGame.timeLeft - dt,
            );
            setTimeLeft(newTimeLeft);
            if (newTimeLeft <= 0) {
                endGame();
                return;
            }

            const phase = useStore.getState().fishingGame.phase;

            // Quando entra in 'waiting' (impostato da FishingGame al landing)
            // attiva timer di morso
            if (phase === 'waiting') {
                if (phaseTimerRef.current <= 0) {
                    // Init: setta timer waiting random
                    phaseTimerRef.current =
                        WAITING_MIN +
                        Math.random() * (WAITING_MAX - WAITING_MIN);
                }
                phaseTimerRef.current -= dt;
                if (phaseTimerRef.current <= 0) {
                    currentFishRef.current = rollFish();
                    phaseTimerRef.current = BITE_WINDOW;
                    setPhase('bite');
                    playBite();
                }
            } else if (phase === 'bite') {
                phaseTimerRef.current -= dt;
                if (phaseTimerRef.current <= 0) {
                    setPopup({ lost: true, reason: 'scappato' });
                    setPhase('lost');
                    playSnap();
                }
            } else if (phase === 'reeling') {
                reelTimerRef.current -= dt;
                // Decadimento tensione
                tensionRef.current = Math.max(
                    0,
                    tensionRef.current - TENSION_DECAY * dt,
                );
                setTensionDisplay(tensionRef.current);
                // Snap se tensione troppo alta
                if (tensionRef.current >= TENSION_SNAP) {
                    setPopup({ lost: true, reason: 'spezzata' });
                    setPhase('lost');
                    playSnap();
                    tensionRef.current = 0;
                    setTensionDisplay(0);
                } else if (reelTimerRef.current <= 0) {
                    setPopup({ lost: true, reason: 'tempo' });
                    setPhase('lost');
                    playSnap();
                }
            } else {
                // aim, flight, hooked, caught, lost: niente decrementi qui
                // (hooked è uno stato istantaneo che diventa reeling)
            }

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [fg.status, setPhase, setTimeLeft, endGame]);

    // Reset phaseTimer quando entriamo in nuova fase
    useEffect(() => {
        if (fg.phase === 'waiting') {
            phaseTimerRef.current =
                WAITING_MIN + Math.random() * (WAITING_MAX - WAITING_MIN);
        }
        if (fg.phase === 'aim') {
            phaseTimerRef.current = 0;
            currentFishRef.current = null;
        }
    }, [fg.phase]);

    function handleAction() {
        const phase = useStore.getState().fishingGame.phase;
        if (phase === 'bite') {
            // Aggancio!
            const fish = currentFishRef.current;
            if (!fish) return;
            setPulls(fish.pulls, fish.pulls);
            reelTimerRef.current = REEL_WINDOW;
            tensionRef.current = 0;
            setTensionDisplay(0);
            setPhase('reeling');
            playReel();
            return;
        }
        if (phase === 'reeling') {
            decPulls();
            playReel();
            // Aumenta tensione (pesci più grossi tirano di più)
            const fish = currentFishRef.current;
            const pullMul = fish ? 1 + fish.pulls * 0.012 : 1; // legendary ~1.4x
            tensionRef.current = Math.min(
                1.4,
                tensionRef.current + TENSION_PER_TAP * pullMul,
            );
            setTensionDisplay(tensionRef.current);
            // Snap immediato se sfora?
            if (tensionRef.current >= TENSION_SNAP) {
                setPopup({ lost: true, reason: 'spezzata' });
                setPhase('lost');
                playSnap();
                tensionRef.current = 0;
                setTensionDisplay(0);
                return;
            }
            // Controlla se completato
            const left = useStore.getState().fishingGame.pullsLeft;
            if (left <= 0) {
                const fishCaught = currentFishRef.current;
                addCatch(fishCaught);
                setPopup({ fish: fishCaught });
                setPhase('caught');
                playCatch(fishCaught.rarity);
                tensionRef.current = 0;
                setTensionDisplay(0);
            }
            return;
        }
        if (phase === 'caught' || phase === 'lost') {
            // Re-cast: torna in aim
            setPopup(null);
            currentFishRef.current = null;
            phaseTimerRef.current = 0;
            setPhase('aim');
            return;
        }
        // aim/flight/waiting → nessuna azione tap
    }

    // Listener globale tasti SPAZIO/Enter
    useEffect(() => {
        if (fg.status !== 'playing') return;
        const onKey = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                handleAction();
            } else if (e.code === 'KeyQ' || e.code === 'Escape') {
                e.preventDefault();
                endGame();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [fg.status, fg.phase]);

    const fadeOverlay = (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: '#000',
                opacity: fadeOpacity,
                transition: `opacity ${FADE_MS}ms ease`,
                zIndex: 2000,
                pointerEvents: fadeOpacity > 0.01 ? 'auto' : 'none',
            }}
        />
    );

    if (fg.status === 'idle' && !fg.fading) return null;

    if (fg.status === 'playing') {
        const phase = fg.phase;
        const reelProgress =
            fg.pullsTotal > 0 ? 1 - fg.pullsLeft / fg.pullsTotal : 0;

        return (
            <>
                {fadeOverlay}

                <button
                    type="button"
                    className="minigame-exit-btn"
                    onClick={endGame}
                    aria-label="Esci dalla pesca"
                >
                    ✕ Esci
                </button>

                {/* TIMER + SCORE TOP */}
                <div
                    className="ui-pill"
                    style={{
                        position: 'fixed',
                        top: 'calc(60px + env(safe-area-inset-top, 0px))',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 100,
                        pointerEvents: 'none',
                    }}
                >
                    <span>🎣 {Math.ceil(fg.timeLeft)}s</span>
                    <span>⭐ {fg.score}</span>
                    <span>🐟 {fg.catches.length}</span>
                </div>

                {/* HINT testuale per fase */}
                {phase === 'aim' && (
                    <Hint
                        title="🎯 Mira nel mare"
                        sub="Clicca / tocca l'oceano per lanciare l'esca"
                    />
                )}
                {phase === 'flight' && <Hint title="…lancio…" />}
                {phase === 'waiting' && (
                    <Hint
                        title="🌊 Aspetta…"
                        sub="Il galleggiante deve affondare"
                    />
                )}
                {phase === 'bite' && (
                    <BigButton
                        text="❗ AGGANCIA!"
                        sub="Tocca / SPAZIO ora!"
                        flash
                        onClick={handleAction}
                    />
                )}
                {phase === 'reeling' && (
                    <ReelHUD
                        progress={reelProgress}
                        timeLeft={reelTimerRef.current}
                        tension={tensionDisplay}
                        onClick={handleAction}
                    />
                )}
                {(phase === 'caught' || phase === 'lost') && popup && (
                    <CatchPopup popup={popup} onContinue={handleAction} />
                )}
            </>
        );
    }

    if (fg.status === 'ended' && !fg.fading) {
        return (
            <>
                {fadeOverlay}
                <EndScreen
                    fg={fg}
                    onRetry={() => {
                        setPopup(null);
                        currentFishRef.current = null;
                        phaseTimerRef.current = 0;
                        reelTimerRef.current = 0;
                        fishingState.bobberPos = null;
                        fishingState.phase = 'aim';
                        fishingRetry();
                    }}
                    onExit={() => fishingExit()}
                />
            </>
        );
    }

    return fadeOverlay;
}

// === COMPONENTI UI ===

function Hint({ title, sub }) {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 60,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fff',
                background: 'rgba(0,0,0,0.55)',
                padding: '10px 18px',
                borderRadius: 12,
                textAlign: 'center',
                fontFamily: 'system-ui, sans-serif',
                pointerEvents: 'none',
                zIndex: 100,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)',
            }}
        >
            <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
            {sub && (
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
                    {sub}
                </div>
            )}
        </div>
    );
}

function BigButton({ text, sub, flash, onClick }) {
    return (
        <>
            <button
                type="button"
                onClick={onClick}
                style={{
                    position: 'fixed',
                    bottom: 80,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#dd2233',
                    color: '#fff',
                    border: 'none',
                    padding: '20px 44px',
                    borderRadius: 16,
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: 24,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(220,34,51,0.5)',
                    zIndex: 110,
                    animation: flash
                        ? 'fishpulse 0.45s infinite alternate'
                        : 'none',
                }}
            >
                {text}
            </button>
            {sub && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 50,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        fontSize: 12,
                        opacity: 0.85,
                        zIndex: 100,
                        pointerEvents: 'none',
                        textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                    }}
                >
                    {sub}
                </div>
            )}
            <style>{`
                @keyframes fishpulse {
                    from { transform: translateX(-50%) scale(1); }
                    to { transform: translateX(-50%) scale(1.08); filter: brightness(1.2); }
                }
            `}</style>
        </>
    );
}

function ReelHUD({ progress, timeLeft, tension, onClick }) {
    const danger = tension >= 0.75;
    // Sweet zone: tap-rate ideale (40%-75% della barra)
    const SWEET_MIN = 0.4;
    const SWEET_MAX = 0.75;
    return (
        <>
            {/* Indicatore composito */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 'calc(180px + env(safe-area-inset-bottom, 0px))',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'min(460px, 90vw)',
                    zIndex: 100,
                    pointerEvents: 'none',
                    fontFamily: 'var(--ui-font)',
                    background: 'rgba(15, 18, 38, 0.78)',
                    border: '1px solid var(--ui-border-strong)',
                    borderRadius: 16,
                    padding: '14px 16px 12px',
                    backdropFilter: 'blur(10px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(140%)',
                    boxShadow: 'var(--ui-shadow-md)',
                }}
            >
                {/* === Tensione lenza === */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: danger ? '#ff8877' : 'rgba(255,255,255,0.85)',
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 6,
                    }}
                >
                    <span>Tensione lenza</span>
                    <span style={{ fontSize: 14 }}>
                        {danger ? '⚠️ Stai per spezzarla!' : ''}
                    </span>
                </div>
                <div
                    style={{
                        position: 'relative',
                        height: 22,
                        background: 'rgba(0,0,0,0.55)',
                        borderRadius: 11,
                        border: '1px solid rgba(255,255,255,0.15)',
                        overflow: 'hidden',
                        marginBottom: 12,
                    }}
                >
                    {/* Sweet zone (verde semi-trasparente) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: `${SWEET_MIN * 100}%`,
                            width: `${(SWEET_MAX - SWEET_MIN) * 100}%`,
                            background:
                                'repeating-linear-gradient(45deg, rgba(74,222,128,0.18) 0 6px, rgba(74,222,128,0.10) 6px 12px)',
                            borderLeft: '1px dashed rgba(74,222,128,0.45)',
                            borderRight: '1px dashed rgba(74,222,128,0.45)',
                        }}
                    />
                    {/* zona rossa critica */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '20%',
                            background:
                                'linear-gradient(to left, rgba(255,85,102,0.55), transparent)',
                        }}
                    />
                    {/* fill barra */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: `${Math.min(100, tension * 100)}%`,
                            background: danger
                                ? 'linear-gradient(to right, #ff9966, #ff3355)'
                                : 'linear-gradient(to right, #4ade80, #ffd633)',
                            transition: 'width 0.08s linear, background 0.15s',
                            boxShadow: danger
                                ? '0 0 12px rgba(255,85,102,0.7)'
                                : 'none',
                        }}
                    />
                    {/* lancetta indicatore */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -2,
                            bottom: -2,
                            left: `${Math.min(100, tension * 100)}%`,
                            width: 3,
                            marginLeft: -1.5,
                            background: '#fff',
                            boxShadow: '0 0 6px rgba(255,255,255,0.9)',
                            transition: 'left 0.08s linear',
                            borderRadius: 2,
                        }}
                    />
                </div>
                <div
                    style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.55)',
                        textAlign: 'center',
                        marginTop: -8,
                        marginBottom: 10,
                        letterSpacing: '0.04em',
                    }}
                >
                    Tieni la lancetta nella zona verde — troppi tap = snap
                </div>

                {/* === Recupero === */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 6,
                    }}
                >
                    <span>Recupero</span>
                    <span>{Math.ceil(timeLeft)}s</span>
                </div>
                <div
                    style={{
                        position: 'relative',
                        height: 14,
                        background: 'rgba(0,0,0,0.55)',
                        borderRadius: 7,
                        border: '1px solid rgba(255,255,255,0.15)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: `${progress * 100}%`,
                            background:
                                'linear-gradient(to right, #6dd5ff, #2a7fff)',
                            transition: 'width 0.1s',
                            boxShadow: '0 0 10px rgba(76,195,255,0.5) inset',
                        }}
                    />
                </div>
            </div>

            <BigButton
                text="🎣 TIRA!"
                sub="Tap ripetuti — attento alla tensione!"
                onClick={onClick}
            />
        </>
    );
}

function CatchPopup({ popup, onContinue }) {
    if (popup.lost) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: '38%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'var(--ui-font)',
                    zIndex: 100,
                }}
            >
                <div
                    style={{
                        background:
                            'linear-gradient(155deg, var(--ui-bg-2), var(--ui-bg-1))',
                        border: '1px solid rgba(255,85,102,0.5)',
                        borderRadius: 16,
                        padding: '20px 28px',
                        boxShadow:
                            '0 18px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,85,102,0.25) inset',
                        color: '#fff',
                    }}
                >
                    <div
                        style={{
                            fontSize: 44,
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        💔 Persa!
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            opacity: 0.85,
                            marginTop: 6,
                        }}
                    >
                        {popup.reason === 'spezzata'
                            ? 'Lenza spezzata — hai tirato troppo!'
                            : popup.reason === 'tempo'
                              ? 'Troppo lento, il pesce si è liberato'
                              : 'Il pesce è scappato'}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onContinue}
                    className="ui-btn ui-btn--ocean"
                    style={{ marginTop: 14, position: 'relative', zIndex: 110 }}
                >
                    Rilancia
                </button>
            </div>
        );
    }
    const f = popup.fish;
    const color = RARITY_COLORS[f.rarity];
    return (
        <div
            style={{
                position: 'fixed',
                top: '38%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                fontFamily: 'var(--ui-font)',
                zIndex: 100,
            }}
        >
            <div
                style={{
                    background:
                        'linear-gradient(155deg, var(--ui-bg-2), var(--ui-bg-1))',
                    border: `1px solid ${color}66`,
                    borderRadius: 16,
                    padding: '24px 32px',
                    boxShadow: `0 0 40px ${color}55, 0 18px 48px rgba(0,0,0,0.5)`,
                    color: '#fff',
                    minWidth: 220,
                }}
            >
                <div
                    style={{
                        fontSize: 64,
                        filter: `drop-shadow(0 0 18px ${color})`,
                    }}
                >
                    {f.emoji}
                </div>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color,
                        letterSpacing: '-0.01em',
                    }}
                >
                    {f.name}
                </div>
                <div
                    style={{
                        display: 'inline-block',
                        fontSize: 11,
                        background: `${color}22`,
                        color,
                        padding: '3px 12px',
                        borderRadius: 999,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginTop: 8,
                        fontWeight: 700,
                    }}
                >
                    {f.rarity} · +{f.score} pt
                </div>
            </div>
            <button
                type="button"
                onClick={onContinue}
                className="ui-btn ui-btn--ocean"
                style={{ marginTop: 14, position: 'relative', zIndex: 110 }}
            >
                Rilancia
            </button>
        </div>
    );
}

function EndScreen({ fg, onRetry, onExit }) {
    const counts = fg.catches.reduce(
        (acc, f) => {
            acc[f.rarity] = (acc[f.rarity] || 0) + 1;
            return acc;
        },
        { common: 0, rare: 0, epic: 0, legendary: 0 },
    );
    return (
        <div className="ui-overlay">
            <div className="ui-card ui-card--compact">
                <h2>🎣 Fine pesca</h2>
                <div className="ui-card-stat">{fg.score} pt</div>
                <p className="ui-card-best">🏆 Record: {fg.bestScore} pt</p>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 16,
                        margin: '14px 0 6px',
                        flexWrap: 'wrap',
                    }}
                >
                    {Object.entries(counts).map(([r, n]) => (
                        <div
                            key={r}
                            style={{
                                color: RARITY_COLORS[r],
                                fontSize: 13,
                                fontWeight: 700,
                                textTransform: 'capitalize',
                                letterSpacing: '0.04em',
                            }}
                        >
                            {r}: {n}
                        </div>
                    ))}
                </div>

                {fg.catches.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 6,
                            justifyContent: 'center',
                            margin: '12px 0 4px',
                            maxHeight: 120,
                            overflowY: 'auto',
                        }}
                    >
                        {fg.catches.map((f, i) => (
                            <span
                                key={i}
                                title={`${f.name} (+${f.score})`}
                                style={{
                                    fontSize: 22,
                                    border: `1px solid ${RARITY_COLORS[f.rarity]}66`,
                                    borderRadius: 8,
                                    padding: '2px 8px',
                                    background: `${RARITY_COLORS[f.rarity]}15`,
                                }}
                            >
                                {f.emoji}
                            </span>
                        ))}
                    </div>
                )}

                <div className="ui-btn-row">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="ui-btn ui-btn--ocean"
                    >
                        Riprova
                    </button>
                    <button
                        type="button"
                        onClick={onExit}
                        className="ui-btn ui-btn--ghost"
                    >
                        Esci
                    </button>
                </div>
            </div>
        </div>
    );
}
