import { useEffect, useRef, useState } from 'react';
import { useStore } from './useStore';
import { surfState, SURF_SEA_POS, SURF_SEA_ROT } from './surfState';

let audioCtx;
function playFall() {
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
        o.frequency.setValueAtTime(400, t);
        o.frequency.exponentialRampToValueAtTime(80, t + 0.5);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + 0.6);
    } catch {}
}

const FALL_THRESHOLD = 0.6;
const FALL_TIME = 0.25;
const FADE_MS = 600;

export function SurfGameHUD() {
    const surf = useStore((s) => s.surfGame);
    const setSurfElapsed = useStore((s) => s.setSurfElapsed);
    const endSurfGame = useStore((s) => s.endSurfGame);
    const startSurfGameAction = useStore((s) => s.startSurfGame);
    const resetSurfGame = useStore((s) => s.resetSurfGame);
    const surfBeginPlaying = useStore((s) => s.surfBeginPlaying);
    const surfRetry = useStore((s) => s.surfRetry);
    const surfExit = useStore((s) => s.surfExit);

    const tiltRef = useRef(0);
    const tiltVelRef = useRef(0);
    const inputRef = useRef(0);
    const dangerTimeRef = useRef(0);
    const startTimeRef = useRef(null);
    const rafRef = useRef(null);
    const lastTickRef = useRef(0);
    const [tiltDisplay, setTiltDisplay] = useState(0);
    const [fadeOpacity, setFadeOpacity] = useState(0);

    // FADE-IN: parte quando viene richiesto un avvio (savedPos arriva)
    // Trigger one-shot via ref per non re-runnare quando lo store cambia.
    const startedRef = useRef(false);
    useEffect(() => {
        if (
            surf.fading &&
            surf.status === 'idle' &&
            surf.savedPos &&
            !startedRef.current
        ) {
            startedRef.current = true;
            setFadeOpacity(1);
            setTimeout(() => {
                surfState.teleportTarget = SURF_SEA_POS;
                surfState.teleportRotY = SURF_SEA_ROT;
                surfState.teleportRequested = true;
                surfState.active = true;
                surfState.tilt = 0;
                tiltRef.current = 0;
                tiltVelRef.current = 0;
                dangerTimeRef.current = 0;
                surfBeginPlaying();
                // Fade out dopo aver portato il player in mare
                setTimeout(() => setFadeOpacity(0), 100);
            }, FADE_MS);
        }
        // Reset del flag quando il game lascia lo stato 'idle'
        // (finita la sequenza di start o uscito completamente)
        if (surf.status !== 'idle' || !surf.fading) {
            // se siamo entrati in playing/ended, possiamo resettare il guard
            if (surf.status !== 'idle') startedRef.current = false;
            // se siamo idle pulito (esci) reset anche
            if (surf.status === 'idle' && !surf.fading)
                startedRef.current = false;
        }
    }, [surf.fading, surf.status, surf.savedPos, surfBeginPlaying]);

    // FADE-OUT: ritorno alla spiaggia (status='ended' && fading=true)
    const endedRef = useRef(false);
    useEffect(() => {
        if (surf.status === 'ended' && surf.fading && !endedRef.current) {
            endedRef.current = true;
            setFadeOpacity(1);
            setTimeout(() => {
                if (surf.savedPos) {
                    surfState.teleportTarget = surf.savedPos;
                    surfState.teleportRotY = surf.savedRotY || 0;
                    surfState.teleportRequested = true;
                }
                surfState.active = false;
                surfState.tilt = 0;
                // Chiude completamente il game (torna a status='idle')
                resetSurfGame();
                setTimeout(() => setFadeOpacity(0), 200);
            }, FADE_MS);
        }
        if (surf.status !== 'ended') endedRef.current = false;
    }, [
        surf.status,
        surf.fading,
        surf.savedPos,
        surf.savedRotY,
        resetSurfGame,
    ]);

    // Input tastiera
    useEffect(() => {
        if (surf.status !== 'playing') return;
        const onDown = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft')
                inputRef.current = -1;
            else if (e.code === 'KeyD' || e.code === 'ArrowRight')
                inputRef.current = 1;
            else if (e.code === 'KeyQ' || e.code === 'Escape') {
                e.preventDefault();
                endSurfGame();
            }
        };
        const onUp = (e) => {
            if (
                e.code === 'KeyA' ||
                e.code === 'KeyD' ||
                e.code === 'ArrowLeft' ||
                e.code === 'ArrowRight'
            ) {
                inputRef.current = 0;
            }
        };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, [surf.status]);

    // Game loop
    useEffect(() => {
        if (surf.status !== 'playing') {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            tiltRef.current = 0;
            tiltVelRef.current = 0;
            dangerTimeRef.current = 0;
            startTimeRef.current = null;
            setTiltDisplay(0);
            return;
        }
        startTimeRef.current = performance.now();
        lastTickRef.current = performance.now();

        const tick = (now) => {
            const dt = Math.min(0.05, (now - lastTickRef.current) / 1000);
            lastTickRef.current = now;
            const elapsedSec = (now - startTimeRef.current) / 1000;

            const wavePower = 4.0 + Math.min(elapsedSec * 0.15, 6.5);
            const inputPower = 5.0;
            const damping = 0.85;

            const wave = (Math.random() - 0.5) * 2 * wavePower * dt;
            const inputAcc = inputRef.current * inputPower * dt;
            tiltVelRef.current += wave + inputAcc;
            tiltVelRef.current *= 1 - damping * dt;
            tiltRef.current += tiltVelRef.current * dt;

            if (tiltRef.current > 1.2) {
                tiltRef.current = 1.2;
                tiltVelRef.current = 0;
            }
            if (tiltRef.current < -1.2) {
                tiltRef.current = -1.2;
                tiltVelRef.current = 0;
            }

            surfState.tilt = tiltRef.current;

            if (Math.abs(tiltRef.current) > FALL_THRESHOLD) {
                dangerTimeRef.current += dt;
                if (dangerTimeRef.current > FALL_TIME) {
                    playFall();
                    setSurfElapsed(elapsedSec);
                    endSurfGame();
                    return;
                }
            } else {
                dangerTimeRef.current = Math.max(
                    0,
                    dangerTimeRef.current - dt * 2,
                );
            }

            setSurfElapsed(elapsedSec);
            setTiltDisplay(tiltRef.current);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [surf.status, endSurfGame, setSurfElapsed]);

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

    if (surf.status === 'idle' && !surf.fading) return null;

    if (surf.status === 'playing') {
        const tiltPct = Math.max(-1, Math.min(1, tiltDisplay));
        const danger = Math.abs(tiltPct) > FALL_THRESHOLD;
        return (
            <>
                {fadeOverlay}
                <button
                    type="button"
                    className="minigame-exit-btn"
                    onClick={endSurfGame}
                    aria-label="Esci dalla sfida surf"
                >
                    ✕ Esci
                </button>
                <div
                    onPointerDown={() => (inputRef.current = -1)}
                    onPointerUp={() => (inputRef.current = 0)}
                    onPointerCancel={() => (inputRef.current = 0)}
                    onPointerLeave={() => (inputRef.current = 0)}
                    style={tapAreaStyle('left')}
                >
                    <div style={tapHintStyle}>◀</div>
                </div>
                <div
                    onPointerDown={() => (inputRef.current = 1)}
                    onPointerUp={() => (inputRef.current = 0)}
                    onPointerCancel={() => (inputRef.current = 0)}
                    onPointerLeave={() => (inputRef.current = 0)}
                    style={tapAreaStyle('right')}
                >
                    <div style={tapHintStyle}>▶</div>
                </div>

                <div
                    style={{
                        position: 'fixed',
                        top: 60,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        padding: '8px 18px',
                        borderRadius: 12,
                        fontFamily: 'system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize: 16,
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        zIndex: 100,
                        pointerEvents: 'none',
                    }}
                >
                    🏄 {surf.elapsed.toFixed(1)}s
                </div>

                <div
                    style={{
                        position: 'fixed',
                        bottom: 60,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'min(420px, 80vw)',
                        zIndex: 100,
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            height: 24,
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: 999,
                            border: '1px solid rgba(255,255,255,0.25)',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                width: `${(1 - FALL_THRESHOLD) * 50}%`,
                                background:
                                    'linear-gradient(to right, rgba(220,50,50,0.55), transparent)',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                right: 0,
                                width: `${(1 - FALL_THRESHOLD) * 50}%`,
                                background:
                                    'linear-gradient(to left, rgba(220,50,50,0.55), transparent)',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: 2,
                                height: 24,
                                marginTop: -12,
                                background: 'rgba(255,255,255,0.5)',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: `${50 + tiltPct * 50}%`,
                                width: 28,
                                height: 28,
                                marginTop: -14,
                                marginLeft: -14,
                                background: danger ? '#dc3232' : '#ffd633',
                                borderRadius: '50%',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                transition: 'background 0.1s',
                                fontSize: 18,
                                lineHeight: '24px',
                                textAlign: 'center',
                            }}
                        >
                            🏄
                        </div>
                    </div>
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: 8,
                            color: '#fff',
                            fontFamily: 'system-ui, sans-serif',
                            fontSize: 13,
                            fontWeight: 600,
                            textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                        }}
                    >
                        A/D · ◀▶ · tocca i lati per inclinarti
                    </div>
                </div>
            </>
        );
    }

    if (surf.status === 'ended' && !surf.fading) {
        const score = Math.floor(surf.elapsed);
        return (
            <>
                {fadeOverlay}
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    <div
                        style={{
                            background: '#1a1a2e',
                            color: '#fff',
                            borderRadius: 16,
                            padding: '2rem 3rem',
                            textAlign: 'center',
                            maxWidth: 420,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>🏄 Wipeout!</h2>
                        <p style={{ opacity: 0.85, fontSize: 18 }}>
                            Sei rimasto in equilibrio per{' '}
                            <strong>{score}s</strong>
                        </p>
                        <p style={{ opacity: 0.6, fontSize: 13 }}>
                            🏆 Miglior tempo: {surf.bestScore}s
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                gap: 12,
                                justifyContent: 'center',
                                marginTop: 20,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    // Riprova in mare: reset tilt locale e ricomincia
                                    tiltRef.current = 0;
                                    tiltVelRef.current = 0;
                                    dangerTimeRef.current = 0;
                                    surfState.tilt = 0;
                                    surfState.active = true;
                                    surfRetry();
                                }}
                                style={btnStyle(true)}
                            >
                                Riprova
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    surfExit();
                                }}
                                style={btnStyle(false)}
                            >
                                Esci
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return fadeOverlay;
}

function tapAreaStyle(side) {
    return {
        position: 'fixed',
        top: 0,
        bottom: 0,
        [side]: 0,
        width: '40vw',
        zIndex: 90,
        background: 'transparent',
        cursor: 'pointer',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
        padding: '0 24px',
    };
}

const tapHintStyle = {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 48,
    fontWeight: 800,
    pointerEvents: 'none',
    userSelect: 'none',
};

function btnStyle(primary) {
    return {
        background: primary ? '#ff9966' : 'rgba(255,255,255,0.1)',
        border: 'none',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
    };
}
