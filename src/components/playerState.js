// Stato del player aggiornato ogni frame da CharacterController.
// Tenuto fuori da React per evitare rerender ad alta frequenza.
// La UI legge questo state via polling leggero (vedi useThrottledPlayerState).
export const playerState = {
    x: 0,
    y: 12,
    z: 0,
    rotY: 0, // yaw del personaggio in radianti
    moving: false,
    onGround: false,
};
