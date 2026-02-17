import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// SUNSET LIGHTING - Illuminazione tramonto con ombre
export const SunsetLighting = () => {
    const sunRef = useRef();

    // Animazione sottile del sole (opzionale)
    useFrame((state) => {
        if (sunRef.current) {
            // Oscillazione molto lenta per simulare movimento naturale
            const time = state.clock.getElapsedTime();
            sunRef.current.position.x = Math.sin(time * 0.1) * 2;
        }
    });

    return (
        <group>
            {/* LUCE SOLE (Directional) - Colore arancione tramonto */}
            <directionalLight
                ref={sunRef}
                position={[80, 15, -40]} // ← SOLE BASSO! (era [50, 40, -30])
                intensity={2.2}
                color="#ffaa66"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={250} // ← Aumentato per ombre lunghe
                shadow-camera-left={-120} // ← Area più grande
                shadow-camera-right={120}
                shadow-camera-top={120}
                shadow-camera-bottom={-120}
                shadow-bias={-0.0005} // ← Ridotto per ombre più definite
            />

            {/* LUCE CIELO (Hemisphere) - Cielo rosato e terra scura */}
            <hemisphereLight
                intensity={0.9} // ← Aumentato da 0.6 a 0.9
                color="#ffb88c" // ← Più chiaro (era #ff8c61)
                groundColor="#6b4423" // ← Terra più chiara (era #3d2817)
            />

            {/* LUCE AMBIENTALE - Riempimento morbido */}
            <ambientLight
                intensity={0.6} // ← Aumentato da 0.3 a 0.6
                color="#ffd4a8" // ← Più chiaro (era #ffb085)
            />

            {/* PUNTO LUCE (opzionale) - Riflesso sul mare */}
            <pointLight
                position={[0, 5, 40]}
                intensity={0.5}
                color="#ffa07a" // Salmone chiaro
                distance={100}
                decay={2}
            />
        </group>
    );
};
