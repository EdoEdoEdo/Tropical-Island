// Replica della formula di elevazione usata in CoastalTerrain.jsx
// Permette di "snap to ground" oggetti decorativi (erba, etc.) senza serializzare
// l'heightmap. Mantenere allineato al loop di generazione in CoastalTerrain.jsx.

const SIZE = 200;
const RADIUS = SIZE / 2; // 100

/**
 * Restituisce l'altezza (world Y) del terreno in (x, z).
 * Il piano è ruotato -PI/2 sull'asse X, ma la formula è simmetrica
 * rispetto al centro quindi worldX/worldZ valgono direttamente.
 */
export function terrainHeight(x, z) {
    const distance = Math.sqrt(x * x + z * z);

    if (distance < RADIUS * 0.7) {
        const centerFactor = 1 - distance / (RADIUS * 0.7);
        let height = Math.pow(centerFactor, 1.5) * 6.0;
        const noiseX = Math.sin(x * 0.15) * Math.cos(-z * 0.15);
        const noiseY = Math.cos(x * 0.12) * Math.sin(-z * 0.18);
        height += (noiseX + noiseY) * 0.3;
        return height;
    }
    if (distance < RADIUS) {
        const beachFactor = 1 - (distance - RADIUS * 0.7) / (RADIUS * 0.3);
        return beachFactor * 0.5;
    }
    return 0;
}
