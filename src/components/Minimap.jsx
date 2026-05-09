import { useThrottledPlayerState } from './useThrottledPlayerState';

/**
 * POI mostrati sulla minimappa — coordinate world (x, z) corrispondenti
 * alle HotZone montate in Island.jsx.
 */
const POIS = [
    { id: 'cinema', x: 0, z: 22, icon: '🎬', color: '#ff9966' },
    { id: 'moai', x: 0, z: -22, icon: '🗿', color: '#9aa0a6' },
    { id: 'house', x: -42, z: 0, icon: '🏠', color: '#ffb86b' },
    { id: 'turtle', x: -35, z: 27, icon: '🐢', color: '#7fc97f' },
    { id: 'fishing', x: -32, z: -28, icon: '🎣', color: '#5fb0ff' },
    { id: 'bonfire', x: 26, z: 0, icon: '🔥', color: '#ff5f4a' },
    { id: 'water', x: 40, z: 30, icon: '🌊', color: '#4ad6ff' },
    { id: 'surf', x: 30, z: 5, icon: '🏄', color: '#ffd34a' },
    { id: 'info', x: 6, z: 6, icon: 'ℹ️', color: '#66aaff' },
];

const MAP_RADIUS = 70; // = OceanBarrier radius
const ISLAND_RADIUS_WORLD = 45;
const SIZE = 160;

export function Minimap() {
    const { x, z, rotY } = useThrottledPlayerState(8);

    const toMap = (wx, wz) => ({
        cx: SIZE / 2 + (wx / MAP_RADIUS) * (SIZE / 2),
        cy: SIZE / 2 - (wz / MAP_RADIUS) * (SIZE / 2),
    });

    const player = toMap(x, z);
    const islandPx = (ISLAND_RADIUS_WORLD / MAP_RADIUS) * (SIZE / 2);

    return (
        <div className="minimap-wrap" aria-hidden="true">
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                style={{ display: 'block' }}
            >
                <defs>
                    <radialGradient id="mm-ocean" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#3aa9d1" />
                        <stop offset="70%" stopColor="#1f6f9a" />
                        <stop offset="100%" stopColor="#123e5c" />
                    </radialGradient>
                    <radialGradient id="mm-island" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#a8d97c" />
                        <stop offset="55%" stopColor="#cdb87a" />
                        <stop offset="100%" stopColor="#e8d29a" />
                    </radialGradient>
                    <radialGradient id="mm-shore" cx="50%" cy="50%" r="50%">
                        <stop
                            offset="60%"
                            stopColor="#ffe6b0"
                            stopOpacity="0"
                        />
                        <stop
                            offset="100%"
                            stopColor="#ffe6b0"
                            stopOpacity="0.55"
                        />
                    </radialGradient>
                </defs>

                {/* Oceano */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={SIZE / 2}
                    fill="url(#mm-ocean)"
                />

                {/* Onde concentriche */}
                {[0.78, 0.88, 0.97].map((s, i) => (
                    <circle
                        key={i}
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={(SIZE / 2) * s}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />
                ))}

                {/* Bagliore costa */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={islandPx + 6}
                    fill="url(#mm-shore)"
                />

                {/* Isola */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={islandPx}
                    fill="url(#mm-island)"
                />

                {/* Prato centrale */}
                <ellipse
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    rx={islandPx * 0.55}
                    ry={islandPx * 0.4}
                    fill="rgba(125, 180, 90, 0.55)"
                />

                {/* N indicator */}
                <text
                    x={SIZE / 2}
                    y={11}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.85)"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="system-ui, sans-serif"
                >
                    N
                </text>
            </svg>

            {/* POI pins (overlay HTML per le emoji) */}
            {POIS.map((p) => {
                const m = toMap(p.x, p.z);
                return (
                    <div
                        key={p.id}
                        className="minimap-pin"
                        title={p.id}
                        style={{ left: m.cx, top: m.cy, background: p.color }}
                    >
                        <span>{p.icon}</span>
                    </div>
                );
            })}

            {/* Player con freccia direzionale */}
            <div
                className="minimap-player"
                style={{
                    left: player.cx,
                    top: player.cy,
                    transform: `translate(-50%, -50%) rotate(${rotY}rad)`,
                }}
            >
                <svg width="14" height="14" viewBox="0 0 14 14">
                    <polygon
                        points="7,1 12,12 7,9 2,12"
                        fill="#fff"
                        stroke="#1a1a2e"
                        strokeWidth="1"
                    />
                </svg>
            </div>
        </div>
    );
}
