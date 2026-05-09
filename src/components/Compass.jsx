import { useThrottledPlayerState } from './useThrottledPlayerState';

const COMPASS_POINTS = [
    { angle: 0, label: 'N' },
    { angle: 90, label: 'E' },
    { angle: 180, label: 'S' },
    { angle: 270, label: 'O' },
];

/**
 * Compass strip orizzontale in alto al centro stile FPS / open world.
 * Mostra i 4 punti cardinali e si scrolla in base alla rotazione del player.
 */
export function Compass() {
    const { rotY } = useThrottledPlayerState(12);

    // rotY = 0 → player guarda verso +Z (nord). Convertiamo in deg.
    const heading = ((rotY * 180) / Math.PI + 360) % 360;

    return (
        <div
            style={{
                position: 'fixed',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 240,
                height: 32,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(6px)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.2)',
                overflow: 'hidden',
                fontFamily: 'system-ui, sans-serif',
                zIndex: 100,
            }}
        >
            {/* Tacca centrale fissa */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: '#ff9966',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                }}
            />
            {COMPASS_POINTS.map((p) => {
                // Distanza angolare dalla heading attuale
                let delta = p.angle - heading;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;
                const x = 120 + (delta / 90) * 60; // 60px = 90°
                if (x < -20 || x > 260) return null;
                return (
                    <span
                        key={p.label}
                        style={{
                            position: 'absolute',
                            left: x,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            opacity: 0.9,
                        }}
                    >
                        {p.label}
                    </span>
                );
            })}
        </div>
    );
}
