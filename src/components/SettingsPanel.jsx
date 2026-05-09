import { useEffect, useState } from 'react';
import { useStore } from './useStore';
import { dayNightState } from './dayNightState';

const TIME_PRESETS = [
    { id: 'midday', label: '☀️ Giorno', t: 0.0 },
    { id: 'sunset', label: '🌅 Tramonto', t: 0.25 },
    { id: 'night', label: '🌙 Notte', t: 0.5 },
    { id: 'dawn', label: '🌄 Alba', t: 0.75 },
];

/**
 * Pannello di settings flottante in alto a destra:
 * - Toggle ciclo giorno/notte
 * - Preset orario (notte/alba/giorno/tramonto) per testing
 * - Toggle effetti post-processing
 * - Toggle audio
 */
export function SettingsPanel() {
    const dayNight = useStore((s) => s.dayNightEnabled);
    const postFX = useStore((s) => s.postFX);
    const audio = useStore((s) => s.audioEnabled);
    const toggleDayNight = useStore((s) => s.toggleDayNight);
    const togglePostFX = useStore((s) => s.togglePostFX);
    const setAudioEnabled = useStore((s) => s.setAudioEnabled);

    // Indicatore orario corrente (polled)
    const [currentTime, setCurrentTime] = useState(dayNightState.time);
    useEffect(() => {
        const id = setInterval(() => setCurrentTime(dayNightState.time), 500);
        return () => clearInterval(id);
    }, []);

    const setTime = (t) => {
        dayNightState.time = t;
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 16,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                zIndex: 100,
                fontFamily: 'system-ui, sans-serif',
                alignItems: 'flex-end',
            }}
        >
            <ToggleButton
                label={`🌗 Ciclo ${dayNight ? 'ON' : 'OFF'}`}
                active={dayNight}
                onClick={toggleDayNight}
            />

            {/* Orologio: ora simulata dal ciclo dayNight */}
            <ClockBadge time={currentTime} />

            {/* Preset orario - utili per debug visivo */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 4,
                    background: 'rgba(0,0,0,0.45)',
                    padding: 6,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(6px)',
                }}
            >
                {TIME_PRESETS.map((p) => {
                    const active = Math.abs(currentTime - p.t) < 0.04;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setTime(p.t)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: 6,
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: active
                                    ? 'rgba(255, 153, 102, 0.85)'
                                    : 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {p.label}
                        </button>
                    );
                })}
            </div>

            <ToggleButton
                label="✨ FX"
                active={postFX}
                onClick={togglePostFX}
            />
            <ToggleButton
                label="🔊 Audio"
                active={audio}
                onClick={() => setAudioEnabled(!audio)}
            />
        </div>
    );
}

function ClockBadge({ time }) {
    const totalMin = ((12 + time * 24) % 24) * 60;
    const h = Math.floor(totalMin / 60);
    const m = Math.floor(totalMin % 60);
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    let icon = '☀️';
    if (h >= 6 && h < 11) icon = '🌅';
    else if (h >= 11 && h < 17) icon = '☀️';
    else if (h >= 17 && h < 20) icon = '🌇';
    else icon = '🌙';
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 0.5,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                fontVariantNumeric: 'tabular-nums',
                userSelect: 'none',
            }}
        >
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span>{`${hh}:${mm}`}</span>
        </div>
    );
}

function ToggleButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            type="button"
            style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: active
                    ? 'rgba(255, 153, 102, 0.85)'
                    : 'rgba(0, 0, 0, 0.55)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'background 0.2s',
                minWidth: 130,
                textAlign: 'left',
            }}
        >
            {label}
        </button>
    );
}
