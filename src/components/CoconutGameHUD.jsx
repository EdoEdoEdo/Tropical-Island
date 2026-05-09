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
                <button
                    type="button"
                    className="minigame-exit-btn"
                    onClick={resetCoconutGame}
                    aria-label="Esci dal minigioco"
                >
                    ✕ Esci
                </button>
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
        <div className="ui-overlay">
            <div className="ui-card ui-card--compact">
                <h2>🥥 Tempo scaduto!</h2>
                <div className="ui-card-stat">{cg.score}</div>
                <p className="ui-card-best">
                    🏆 Miglior punteggio: {cg.bestScore}
                </p>
                <div className="ui-btn-row">
                    <button
                        type="button"
                        onClick={startCoconutGame}
                        className="ui-btn ui-btn--primary"
                    >
                        Rigioca
                    </button>
                    <button
                        type="button"
                        onClick={resetCoconutGame}
                        className="ui-btn ui-btn--ghost"
                    >
                        Esci
                    </button>
                </div>
            </div>
        </div>
    );
}
