import { useEffect, useState } from 'react';
import { playerState } from './playerState';

/**
 * Polling leggero (default 6 Hz) dello stato player per UI HUD.
 * Evita di chiamare setState ogni frame.
 */
export function useThrottledPlayerState(hz = 6) {
    const [snapshot, setSnapshot] = useState({
        x: 0,
        z: 0,
        rotY: 0,
        moving: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setSnapshot({
                x: playerState.x,
                z: playerState.z,
                rotY: playerState.rotY,
                moving: playerState.moving,
            });
        }, 1000 / hz);
        return () => clearInterval(interval);
    }, [hz]);

    return snapshot;
}
