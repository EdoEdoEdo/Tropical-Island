import { useStore } from './useStore';

function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * HUD del minigame: timer top-center sotto la bussola + counter sfere.
 * Si mostra solo quando status === 'playing'.
 * Modale risultato gestita separatamente.
 */
export function OrbHuntHUD() {
    const orbHunt = useStore((s) => s.orbHunt);
    const resetOrbHunt = useStore((s) => s.resetOrbHunt);
    const startOrbHunt = useStore((s) => s.startOrbHunt);

    if (orbHunt.status === 'idle') return null;

    if (orbHunt.status === 'playing') {
        const danger = orbHunt.timeLeft < 30;
        return (
            <>
                <div
                    style={{
                        position: 'fixed',
                        top: 'calc(60px + env(safe-area-inset-top, 0px))',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: danger
                            ? 'rgba(220, 50, 50, 0.85)'
                            : 'rgba(0, 0, 0, 0.65)',
                        color: '#fff',
                        padding: '8px clamp(12px, 4vw, 18px)',
                        borderRadius: 12,
                        fontFamily: 'system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize: 'clamp(14px, 3.6vw, 16px)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        zIndex: 100,
                        display: 'flex',
                        gap: 'clamp(10px, 3vw, 16px)',
                        alignItems: 'center',
                        animation: danger
                            ? 'pulse 0.8s ease-in-out infinite'
                            : 'none',
                    }}
                >
                    <span>⏱ {fmtTime(orbHunt.timeLeft)}</span>
                    <span>
                        ✨ {orbHunt.collected}/{orbHunt.target}
                    </span>
                </div>
                <button
                    type="button"
                    className="minigame-exit-btn"
                    onClick={resetOrbHunt}
                    aria-label="Esci dal minigioco"
                >
                    ✕ Esci
                </button>
            </>
        );
    }

    // won / lost → modale risultato
    const won = orbHunt.status === 'won';
    return (
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
                <h2 style={{ marginTop: 0 }}>
                    {won ? '🎉 Hai vinto!' : '⏰ Tempo scaduto'}
                </h2>
                <p style={{ opacity: 0.85 }}>
                    {won
                        ? `Hai raccolto tutte le ${orbHunt.target} sfere in ${fmtTime(180 - orbHunt.timeLeft)}.`
                        : `Hai raccolto ${orbHunt.collected} sfere su ${orbHunt.target}.`}
                </p>
                {orbHunt.bestTime !== null && (
                    <p style={{ opacity: 0.6, fontSize: 13 }}>
                        🏆 Miglior tempo: {fmtTime(orbHunt.bestTime)}
                    </p>
                )}
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
                        onClick={startOrbHunt}
                        style={btnStyle(true)}
                    >
                        Rigioca
                    </button>
                    <button
                        type="button"
                        onClick={resetOrbHunt}
                        style={btnStyle(false)}
                    >
                        Esci
                    </button>
                </div>
            </div>
        </div>
    );
}

function btnStyle(primary) {
    return {
        padding: '10px 20px',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.2)',
        background: primary ? '#ff9966' : 'rgba(255,255,255,0.1)',
        color: '#fff',
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
    };
}
