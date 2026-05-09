import { useFrame, useThree } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';
import { useEffect } from 'react';
import { dayNightState } from './dayNightState';

const tmp = new Color();

/**
 * Fog atmosferica esponenziale che si tinge col colore del cielo.
 * Crea raccordo soft tra mare e cielo, eliminando lo "stacco" all'orizzonte.
 */
export function AtmosphericFog() {
    const { scene } = useThree();

    useEffect(() => {
        // Densità molto bassa: solo accenno atmosferico, niente "muro" all'orizzonte
        scene.fog = new FogExp2('#cfe6f0', 0.0018);
        return () => {
            scene.fog = null;
        };
    }, [scene]);

    useFrame(() => {
        if (!scene.fog) return;
        // Tinta verso colore orizzonte
        tmp.setRGB(
            dayNightState.horizon.r,
            dayNightState.horizon.g,
            dayNightState.horizon.b,
        );
        scene.fog.color.copy(tmp);
        // Anche background della scena se presente
        if (scene.background?.isColor) scene.background.copy(tmp);
    });

    return null;
}
