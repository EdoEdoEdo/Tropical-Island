import { useFrame } from '@react-three/fiber';
import { useEffect } from 'react';
import { dayNightState } from './dayNightState';
import { useStore } from './useStore';

/**
 * Driver del ciclo giorno/notte: avanza dayNightState.time ogni frame.
 * Sincronizza enabled con lo store (toggle UI).
 */
export function DayNightDriver() {
    const enabled = useStore((s) => s.dayNightEnabled);

    useEffect(() => {
        dayNightState.enabled = enabled;
    }, [enabled]);

    useFrame((_, delta) => {
        if (!dayNightState.enabled) return;
        dayNightState.time =
            (dayNightState.time + delta * dayNightState.speed) % 1;
    });
    return null;
}
