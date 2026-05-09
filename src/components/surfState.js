// Stato della modalità surf condiviso fuori da React per accesso ad alta freq.
export const surfState = {
    active: false,
    tilt: 0, // [-1, +1] aggiornato dal game loop
    teleportRequested: false, // CharacterController gestisce il teleport on-change
    teleportTarget: null, // [x, y, z] dove andare
    teleportRotY: 0,
};

// Punto in mare dove appare il surfer (largo della costa nord-ovest)
export const SURF_SEA_POS = [50, 1.6, 50];
export const SURF_SEA_ROT = -Math.PI * 0.75; // guarda verso la riva
