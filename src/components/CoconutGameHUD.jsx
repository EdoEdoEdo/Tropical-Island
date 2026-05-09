import { useStore } from './useStore';

function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

export function CoconutGameHUD() {
    const cg = useStore((s) => s.coconutGame);
    const startCoconutGame = useStore((s) => s.startCoconutGame);
    const resetCoconutGame = useStore((s) => s.resetCoconutGame);

    if (cg.status === 'idle') return null;

    if (cg.status === 'playing') {
        const danger = cg.timeLeft < 10;
        return (
            <>
                <div
                    style={{
                        position: 'fixed',
                        top: 60,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: danger
                            ? 'rgba(220, 50, 50, 0.85)'
                            : 'rgba(0, 0, 0, 0.65)',
                        color: '#fff',
                        padding: '8px 18px',
                        borderRadius: 12,
                        fontFamily: 'system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize: 16,
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        zIndex: 100,
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        animation: danger
                            ? 'pulse 0.8s ease-in-out infinite'
                            : 'none',
                    }}
                >
                    <span>⏱ {fmtTime(cg.timeLeft)}</span>
                    <span>🥥 {cg.score}</span>
                    {cg.combo > 1 && (
                        <span style={{ color: '#ffd633' }}>×{cg.combo}</span>
                    )}
                </div>

                {/* Crosshair / istruzioni */}
                <div
                    style={{
                        position: 'fixed',
                        bottom: 80,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: 999,
                        fontFamily: 'system-ui, sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                        zIndex: 100,
                        backdropFilter: 'blur(6px)',
                        pointerEvents: 'none',
                    }}
                >
                    🎯 Tocca/clicca sul mare per lanciare un sasso
                </div>
            </>
        );
    }

    // ended
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
                <h2 style={{ marginTop: 0 }}>🥥 Tempo scaduto!</h2>
                <p style={{ opacity: 0.85, fontSize: 18 }}>
                    Punteggio: <strong>{cg.score}</strong>
                </p>
                <p style={{ opacity: 0.6, fontSize: 13 }}>
                    🏆 Miglior punteggio: {cg.bestScore}
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
                        onClick={startCoconutGame}
                        style={btnStyle(true)}
                    >
                        Rigioca
                    </button>
                    <button
                        type="button"
                        onClick={resetCoconutGame}
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
