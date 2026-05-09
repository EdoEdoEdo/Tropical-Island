import { KeyboardControls, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Joystick, JumpButton } from './components/Joystick';
import { BackgroundMusic } from './components/BackgroundMusic';
import { OceanSounds } from './components/OceanSounds';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Modal } from './components/Modal';
import { Minimap } from './components/Minimap';
import { Compass } from './components/Compass';
import { Clock } from './components/Clock';
import { OrbHuntHUD } from './components/OrbHuntHUD';
import { CoconutGameHUD } from './components/CoconutGameHUD';
import { SurfGameHUD } from './components/SurfGameHUD';
import { FishingGameHUD } from './components/FishingGameHUD';
import { useStore } from './components/useStore';

// 🧱 Scena + Physics caricate solo dopo START → Rapier fuori dal bundle iniziale
const Scene = lazy(() => import('./components/Scene'));

export const Controls = {
    forward: 'forward',
    back: 'back',
    left: 'left',
    right: 'right',
    jump: 'jump',
};

const JOYSTICK_THRESHOLD = 0.3;

function App() {
    const [started, setStarted] = useState(false);
    const [sceneReady, setSceneReady] = useState(false);
    const setAudioEnabled = useStore((s) => s.setAudioEnabled);
    const setMobileControls = useStore((s) => s.setMobileControls);
    const surfStatus = useStore((s) => s.surfGame.status);
    const fishingStatus = useStore((s) => s.fishingGame.status);
    // Solo Surf e Fishing bloccano i controlli mobile (il personaggio è fermo o sulla tavola).
    // OrbHunt e Coconut richiedono di camminare → il joystick deve restare visibile.
    const minigameActive =
        surfStatus === 'playing' || fishingStatus === 'playing';

    // Traccia il progress globale dei loader drei (GLB, texture, ecc.)
    const { active, progress } = useProgress();

    // Quando lo scene è montato e tutti gli asset sono caricati,
    // marca sceneReady → smonta il LoadingScreen.
    // Aspettiamo che la progress bar arrivi visivamente al 100% prima di nascondere.
    useEffect(() => {
        if (started && !active && progress === 100) {
            const t = setTimeout(() => setSceneReady(true), 900);
            return () => clearTimeout(t);
        }
    }, [started, active, progress]);

    const handleJoystickMove = useCallback(
        ({ x, y }) => {
            setMobileControls({
                forward: y > JOYSTICK_THRESHOLD,
                back: y < -JOYSTICK_THRESHOLD,
                right: x > JOYSTICK_THRESHOLD,
                left: x < -JOYSTICK_THRESHOLD,
            });
        },
        [setMobileControls],
    );

    const handleJump = useCallback(
        (isPressed) => {
            setMobileControls({ jump: isPressed });
        },
        [setMobileControls],
    );

    const handleStart = useCallback(() => {
        setStarted(true);
        setAudioEnabled(true);
        if (import.meta.env.DEV) {
            console.log('🎮 Experience started - Audio enabled');
        }
    }, [setAudioEnabled]);

    return (
        <ErrorBoundary>
            {/* 🎮 LOADING & START SCREEN — visibile finché la scena non è pronta */}
            {!sceneReady && (
                <LoadingScreen
                    onStart={handleStart}
                    started={started}
                    progress={progress}
                />
            )}

            <KeyboardControls
                map={[
                    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
                    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
                    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
                    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
                    { name: Controls.jump, keys: ['Space'] },
                ]}
            >
                <Canvas
                    shadows
                    dpr={[1, 1.75]}
                    gl={{
                        antialias: true,
                        powerPreference: 'high-performance',
                        toneMappingExposure: 1.35,
                    }}
                    camera={{
                        position: [0, 20, -25],
                        fov: 60,
                    }}
                >
                    <color attach="background" args={['#ffb088']} />
                    <Suspense fallback={null}>{started && <Scene />}</Suspense>
                </Canvas>
            </KeyboardControls>

            {/* Controlli Mobile - nascosti durante i minigiochi (la pesca usa solo tap) */}
            {sceneReady && !minigameActive && (
                <>
                    <Joystick onMove={handleJoystickMove} />
                    <JumpButton onJump={handleJump} />
                </>
            )}

            {/* UI flottante */}
            {sceneReady && (
                <>
                    <Minimap />
                    <Compass />
                    <Clock />
                    <OrbHuntHUD />
                    <CoconutGameHUD />
                    <SurfGameHUD />
                    <FishingGameHUD />
                </>
            )}
            <Modal />

            {/* 🎵 AUDIO ambient - Fuori dal Canvas! */}
            <BackgroundMusic />
            <OceanSounds />
        </ErrorBoundary>
    );
}

export default App;
