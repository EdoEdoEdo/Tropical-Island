// 🏝️ ISLAND LAYOUT - Posizionamento dichiarativo di tutti gli asset.
// Modifica qui per spostare/aggiungere oggetti senza toccare Island.jsx.

const PI = Math.PI;

// 🌴 PALME - 15 totali, distribuite in 3 anelli
export const palmTrees = [
    // Anello interno (5)
    { position: [8, 4.7, 5], variant: 1, scale: 2.4, rotation: 0.5 },
    { position: [-6, 5, -8], variant: 2, scale: 2.2, rotation: 1.2 },
    { position: [10, 5, -6], variant: 3, scale: 2.6, rotation: 2.1 },
    { position: [-9, 4.5, 7], variant: 1, scale: 2.0, rotation: 0.8 },
    { position: [5, 5, -10], variant: 2, scale: 2.4, rotation: 1.7 },
    // Anello medio (6)
    { position: [15, 3.8, 10], variant: 3, scale: 2.2, rotation: 0.3 },
    { position: [-14, 3.6, -12], variant: 1, scale: 2.6, rotation: 1.9 },
    { position: [18, 3.9, -8], variant: 2, scale: 2.0, rotation: 2.5 },
    { position: [-16, 3.7, 9], variant: 3, scale: 2.4, rotation: 0.6 },
    { position: [12, 4.0, -15], variant: 1, scale: 2.2, rotation: 1.4 },
    { position: [-10, 3.8, 14], variant: 2, scale: 2.6, rotation: 2.8 },
    // Anello esterno (4)
    { position: [22, 3.0, 15], variant: 3, scale: 2.0, rotation: 0.9 },
    { position: [-20, 2.9, -18], variant: 1, scale: 2.4, rotation: 1.6 },
    { position: [25, 3.1, -12], variant: 2, scale: 2.2, rotation: 2.3 },
    { position: [-23, 2.8, 16], variant: 3, scale: 2.6, rotation: 0.4 },
];

// 🦀 GRANCHI - Sud
export const crabs = [
    { position: [7, 2.2, -40], rotation: PI, scale: 0.0015 },
    { position: [8, 2.3, -39], rotation: PI / 1.1, scale: 0.0016 },
    { position: [9, 2.2, -40], rotation: PI / 1.6, scale: 0.0014 },
];

// 🔥 TORCE davanti al Moai
export const torches = [
    { position: [-4, 4.5, -19], scale: 2, rotation: PI },
    { position: [4, 4.5, -19], scale: 2, rotation: PI },
];
