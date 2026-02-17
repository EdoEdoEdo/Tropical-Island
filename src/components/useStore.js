import create from 'zustand';

export const useStore = create((set) => ({
    // Water/Ocean parameters (Coastal World values)
    waterLevel: 0.9,
    waveSpeed: 1.0,
    waveAmplitude: 0.1,
    foamDepth: 0.15,

    // Ocean colors
    oceanColorDeep: '#2563eb',
    oceanColorSurface: '#60a5fa',
    oceanColorFoam: '#ffffff',

    // Audio
    audioEnabled: false,

    // Actions
    setWaterLevel: (level) => set({ waterLevel: level }),
    setWaveSpeed: (speed) => set({ waveSpeed: speed }),
    setWaveAmplitude: (amplitude) => set({ waveAmplitude: amplitude }),
    setFoamDepth: (depth) => set({ foamDepth: depth }),
    setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),

    // Color actions
    setOceanColorDeep: (color) => set({ oceanColorDeep: color }),
    setOceanColorSurface: (color) => set({ oceanColorSurface: color }),
    setOceanColorFoam: (color) => set({ oceanColorFoam: color }),
}));
