import { useEffect, useState } from 'react';
import { dayNightState } from './dayNightState';

/**
 * Orologio sotto la bussola. Mostra l'ora simulata dal ciclo dayNight.
 * dayNightState.time: 0 = midday, 0.25 = sunset, 0.5 = night, 0.75 = dawn.
 */
export function Clock() {
    const [time, setTime] = useState(dayNightState.time);

    useEffect(() => {
        const id = setInterval(() => setTime(dayNightState.time), 500);
        return () => clearInterval(id);
    }, []);

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
                position: 'fixed',
                top: 'calc(56px + env(safe-area-inset-top, 0px))',
                left: '50%',
                transform: 'translateX(-50%)',
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
                zIndex: 100,
                fontFamily: 'system-ui, sans-serif',
                pointerEvents: 'none',
            }}
        >
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span>{`${hh}:${mm}`}</span>
        </div>
    );
}
