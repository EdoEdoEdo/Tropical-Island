// Stato della modalità pesca, fuori da React per accesso ad alta freq.
export const fishingState = {
    active: false,
    teleportRequested: false,
    teleportTarget: null,
    teleportRotY: 0,
    // 'aim' | 'flight' | 'waiting' | 'bite' | 'hooked' | 'reeling' | 'caught' | 'lost'
    phase: 'aim',
    // Posizione mondo del galleggiante (aggiornata dal FishingGame)
    bobberPos: null,
    // Quanto è affondato il bobber [0..1]
    bobberSink: 0,
};

// Spot di pesca sulla riva, vicino alla Rowboat (-35, 1, -25)
// Posizione sulla sabbia con vista aperta verso il largo (sud)
export const FISH_SHORE_POS = [-32, 5, -28];
// Guarda verso il largo (sud-est)
export const FISH_SHORE_ROT = -Math.PI * 0.35 - (70 * Math.PI) / 180;
