import { create } from 'zustand';

const ORB_TARGET = 12;
const ORB_TIMER = 180; // 3 minuti in secondi

const COCONUT_TIMER = 120; // 2 minuti

const initialBest =
    typeof window !== 'undefined'
        ? Number(localStorage.getItem('orbHuntBest')) || null
        : null;

const initialBestCoconut =
    typeof window !== 'undefined'
        ? Number(localStorage.getItem('coconutGameBest')) || 0
        : 0;

const initialBestSurf =
    typeof window !== 'undefined'
        ? Number(localStorage.getItem('surfGameBest')) || 0
        : 0;

const FISHING_TIMER = 90; // 90s

const initialBestFishing =
    typeof window !== 'undefined'
        ? Number(localStorage.getItem('fishingGameBest')) || 0
        : 0;

export const useStore = create((set, get) => ({
    // Water/Ocean parameters
    waterLevel: 0.9,
    waveSpeed: 1.0,
    waveAmplitude: 0.1,
    foamDepth: 0.15,

    // Audio
    audioEnabled: false,

    // Postprocessing toggle
    postFX: true,

    // Day/night cycle toggle
    dayNightEnabled: true,

    // Modal aperto: null | 'cinema' | 'info' | 'moai' | 'house' | 'bonfire' | 'water' | 'parrot'
    modal: null,

    // Mobile virtual controls
    mobileControls: {
        forward: false,
        back: false,
        left: false,
        right: false,
        jump: false,
    },

    // ===== ORB HUNT MINIGAME =====
    orbHunt: {
        status: 'idle', // 'idle' | 'playing' | 'won' | 'lost'
        collected: 0,
        target: ORB_TARGET,
        timeLeft: ORB_TIMER,
        bestTime: initialBest,
    },

    // Actions
    setWaterLevel: (level) => set({ waterLevel: level }),
    setWaveSpeed: (speed) => set({ waveSpeed: speed }),
    setWaveAmplitude: (amplitude) => set({ waveAmplitude: amplitude }),
    setFoamDepth: (depth) => set({ foamDepth: depth }),
    setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
    setPostFX: (v) => set({ postFX: v }),
    togglePostFX: () => set((s) => ({ postFX: !s.postFX })),
    setDayNight: (v) => set({ dayNightEnabled: v }),
    toggleDayNight: () => set((s) => ({ dayNightEnabled: !s.dayNightEnabled })),
    openModal: (modal) => set({ modal }),
    closeModal: () => set({ modal: null }),
    setMobileControls: (partial) =>
        set((state) => ({
            mobileControls: { ...state.mobileControls, ...partial },
        })),

    startOrbHunt: () =>
        set((s) => ({
            orbHunt: {
                ...s.orbHunt,
                status: 'playing',
                collected: 0,
                timeLeft: ORB_TIMER,
            },
            modal: null,
        })),

    collectOrb: () => {
        const oh = get().orbHunt;
        if (oh.status !== 'playing') return;
        const collected = oh.collected + 1;
        if (collected >= oh.target) {
            const elapsed = ORB_TIMER - oh.timeLeft;
            const best =
                oh.bestTime === null ? elapsed : Math.min(oh.bestTime, elapsed);
            try {
                localStorage.setItem('orbHuntBest', String(best));
            } catch {}
            set({
                orbHunt: {
                    ...oh,
                    collected,
                    status: 'won',
                    bestTime: best,
                },
            });
        } else {
            set({ orbHunt: { ...oh, collected } });
        }
    },

    tickOrbHunt: (delta) => {
        const oh = get().orbHunt;
        if (oh.status !== 'playing') return;
        const timeLeft = oh.timeLeft - delta;
        if (timeLeft <= 0) {
            set({ orbHunt: { ...oh, timeLeft: 0, status: 'lost' } });
        } else {
            set({ orbHunt: { ...oh, timeLeft } });
        }
    },

    resetOrbHunt: () =>
        set((s) => ({
            orbHunt: {
                ...s.orbHunt,
                status: 'idle',
                collected: 0,
                timeLeft: ORB_TIMER,
            },
        })),

    // ===== COCONUT THROW MINIGAME =====
    coconutGame: {
        status: 'idle', // 'idle' | 'playing' | 'ended'
        score: 0,
        combo: 1,
        timeLeft: COCONUT_TIMER,
        bestScore: initialBestCoconut,
    },
    startCoconutGame: () =>
        set((s) => ({
            coconutGame: {
                ...s.coconutGame,
                status: 'playing',
                score: 0,
                combo: 1,
                timeLeft: COCONUT_TIMER,
            },
            modal: null,
        })),
    addCoconutHit: () =>
        set((s) => {
            const cg = s.coconutGame;
            if (cg.status !== 'playing') return {};
            return {
                coconutGame: {
                    ...cg,
                    score: cg.score + cg.combo,
                    combo: Math.min(cg.combo + 1, 5),
                },
            };
        }),
    resetCoconutCombo: () =>
        set((s) => {
            if (s.coconutGame.combo === 1) return {};
            return { coconutGame: { ...s.coconutGame, combo: 1 } };
        }),
    tickCoconutGame: (delta) => {
        const cg = get().coconutGame;
        if (cg.status !== 'playing') return;
        const timeLeft = cg.timeLeft - delta;
        if (timeLeft <= 0) {
            const best = Math.max(cg.bestScore || 0, cg.score);
            try {
                localStorage.setItem('coconutGameBest', String(best));
            } catch {}
            set({
                coconutGame: {
                    ...cg,
                    timeLeft: 0,
                    status: 'ended',
                    bestScore: best,
                },
            });
        } else {
            set({ coconutGame: { ...cg, timeLeft } });
        }
    },
    resetCoconutGame: () =>
        set((s) => ({
            coconutGame: {
                ...s.coconutGame,
                status: 'idle',
                score: 0,
                combo: 1,
                timeLeft: COCONUT_TIMER,
            },
        })),

    // ===== SURF CHALLENGE =====
    surfGame: {
        status: 'idle', // 'idle' | 'playing' | 'ended'
        elapsed: 0,
        bestScore: initialBestSurf,
        savedPos: null,
        savedRotY: 0,
        fading: false,
    },
    startSurfGame: (savedPos = [0, 1, 0], savedRotY = 0) => {
        // Avvio differito: prima fade, poi teleport, poi playing
        set((s) => ({
            surfGame: {
                ...s.surfGame,
                status: 'idle',
                elapsed: 0,
                savedPos,
                savedRotY,
                fading: true,
            },
            modal: null,
        }));
    },
    surfBeginPlaying: () =>
        set((s) => ({
            surfGame: { ...s.surfGame, status: 'playing', fading: false },
        })),
    // Riprova senza fade né teleport: il player è già in mare
    surfRetry: () =>
        set((s) => ({
            surfGame: {
                ...s.surfGame,
                status: 'playing',
                elapsed: 0,
                fading: false,
            },
        })),
    surfStartFadeOut: () =>
        set((s) => ({ surfGame: { ...s.surfGame, fading: true } })),
    setSurfElapsed: (elapsed) =>
        set((s) => {
            if (s.surfGame.status !== 'playing') return {};
            return { surfGame: { ...s.surfGame, elapsed } };
        }),
    endSurfGame: () =>
        set((s) => {
            if (s.surfGame.status !== 'playing') return {};
            const score = Math.floor(s.surfGame.elapsed);
            const best = Math.max(s.surfGame.bestScore || 0, score);
            try {
                localStorage.setItem('surfGameBest', String(best));
            } catch {}
            return {
                surfGame: {
                    ...s.surfGame,
                    status: 'ended',
                    bestScore: best,
                    // Player resta in mare: il fade-out parte solo se preme "Esci"
                    fading: false,
                },
            };
        }),
    // L'utente sceglie di uscire: avvia fade-out + ritorno spiaggia
    surfExit: () => set((s) => ({ surfGame: { ...s.surfGame, fading: true } })),
    resetSurfGame: () =>
        set((s) => ({
            surfGame: {
                ...s.surfGame,
                status: 'idle',
                elapsed: 0,
                fading: false,
            },
        })),

    // ===== FISHING =====
    fishingGame: {
        status: 'idle', // 'idle' | 'playing' | 'ended'
        // 'aim' | 'flight' | 'waiting' | 'bite' | 'hooked' | 'reeling' | 'caught' | 'lost'
        phase: 'aim',
        timeLeft: FISHING_TIMER,
        score: 0,
        catches: [],
        lastCatch: null,
        // Mash mechanic: click necessari per ritirare + progresso corrente
        pullsLeft: 0,
        pullsTotal: 0,
        bestScore: initialBestFishing,
        savedPos: null,
        savedRotY: 0,
        fading: false,
    },
    startFishingGame: (savedPos = [0, 1, 0], savedRotY = 0) =>
        set((s) => ({
            fishingGame: {
                ...s.fishingGame,
                status: 'idle',
                phase: 'aim',
                timeLeft: FISHING_TIMER,
                score: 0,
                catches: [],
                lastCatch: null,
                pullsLeft: 0,
                pullsTotal: 0,
                savedPos,
                savedRotY,
                fading: true,
            },
            modal: null,
        })),
    fishingBeginPlaying: () =>
        set((s) => ({
            fishingGame: {
                ...s.fishingGame,
                status: 'playing',
                phase: 'aim',
                fading: false,
            },
        })),
    setFishingPhase: (phase) =>
        set((s) => ({ fishingGame: { ...s.fishingGame, phase } })),
    setFishingPulls: (pullsLeft, pullsTotal) =>
        set((s) => ({
            fishingGame: {
                ...s.fishingGame,
                pullsLeft,
                pullsTotal:
                    pullsTotal !== undefined
                        ? pullsTotal
                        : s.fishingGame.pullsTotal,
            },
        })),
    decFishingPulls: () =>
        set((s) => {
            const left = Math.max(0, s.fishingGame.pullsLeft - 1);
            return { fishingGame: { ...s.fishingGame, pullsLeft: left } };
        }),
    setFishingTimeLeft: (timeLeft) =>
        set((s) => {
            if (s.fishingGame.status !== 'playing') return {};
            return { fishingGame: { ...s.fishingGame, timeLeft } };
        }),
    addFishingCatch: (fish) =>
        set((s) => {
            const score = s.fishingGame.score + fish.score;
            return {
                fishingGame: {
                    ...s.fishingGame,
                    catches: [...s.fishingGame.catches, fish],
                    lastCatch: fish,
                    score,
                },
            };
        }),
    fishingRetry: () =>
        set((s) => ({
            fishingGame: {
                ...s.fishingGame,
                status: 'playing',
                phase: 'aim',
                timeLeft: FISHING_TIMER,
                score: 0,
                catches: [],
                lastCatch: null,
                pullsLeft: 0,
                pullsTotal: 0,
                fading: false,
            },
        })),
    endFishingGame: () =>
        set((s) => {
            if (s.fishingGame.status !== 'playing') return {};
            const best = Math.max(
                s.fishingGame.bestScore || 0,
                s.fishingGame.score,
            );
            try {
                localStorage.setItem('fishingGameBest', String(best));
            } catch {}
            return {
                fishingGame: {
                    ...s.fishingGame,
                    status: 'ended',
                    bestScore: best,
                    fading: false,
                },
            };
        }),
    fishingExit: () =>
        set((s) => ({ fishingGame: { ...s.fishingGame, fading: true } })),
    resetFishingGame: () =>
        set((s) => ({
            fishingGame: {
                ...s.fishingGame,
                status: 'idle',
                phase: 'aim',
                timeLeft: FISHING_TIMER,
                fading: false,
            },
        })),
}));
