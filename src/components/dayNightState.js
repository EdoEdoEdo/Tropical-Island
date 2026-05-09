// Stato condiviso del ciclo giorno/notte.
// time normalizzato 0..1:
//   0.00 → midday   (azzurro pieno)
//   0.25 → sunset   (rosa-arancio caldo)
//   0.50 → night    (blu profondo)
//   0.75 → dawn     (rosa-arancio tenue)
//   1.00 → midday   (loop)
export const dayNightState = {
    time: 0.18, // partiamo poco prima del tramonto
    enabled: true,
    speed: 1 / 240, // 240s = ciclo completo
    // Colori del cielo (aggiornati da SunsetSky ogni frame)
    horizon: { r: 1.0, g: 0.7, b: 0.55 }, // = bottomColor
    skyMiddle: { r: 0.5, g: 0.7, b: 0.85 },
    skyTop: { r: 0.05, g: 0.43, b: 0.99 },
    // Sole (aggiornato da SunsetLighting ogni frame)
    sunDir: { x: 0, y: 1, z: 0 }, // direzione normalizzata verso il sole
    sunColor: { r: 1, g: 0.96, b: 0.84 },
    sunAbove: 1, // 0..1 quanto è sopra orizzonte
};
