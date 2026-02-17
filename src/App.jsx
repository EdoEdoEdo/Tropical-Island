import { KeyboardControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense, useState } from 'react';
import { Experience } from './components/Experience';
import { Joystick, JumpButton } from './components/Joystick';
import { BackgroundMusic } from './components/BackgroundMusic';
import { OceanSounds } from './components/OceanSounds';
import { LoadingScreen } from './components/LoadingScreen';
import { useStore } from './components/useStore';

export const Controls = {
    forward: 'forward',
    back: 'back',
    left: 'left',
    right: 'right',
    jump: 'jump',
};

// Virtual controls state per mobile
export const mobileControls = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
};

function App() {
    const [, forceUpdate] = useState();
    const [started, setStarted] = useState(false);
    const store = useStore();

    const handleJoystickMove = ({ x, y }) => {
        // Reset controls
        mobileControls.forward = false;
        mobileControls.back = false;
        mobileControls.left = false;
        mobileControls.right = false;

        // Threshold per evitare micro-movimenti
        const threshold = 0.3;

        if (Math.abs(y) > threshold) {
            if (y > 0) {
                mobileControls.forward = true;
            } else {
                mobileControls.back = true;
            }
        }

        if (Math.abs(x) > threshold) {
            if (x > 0) {
                mobileControls.right = true;
            } else {
                mobileControls.left = true;
            }
        }

        forceUpdate({});
    };

    const handleJump = (isPressed) => {
        mobileControls.jump = isPressed;
        forceUpdate({});
    };

    const handleStart = () => {
        setStarted(true);
        // Abilita audio quando utente preme START
        store.setAudioEnabled(true);
        console.log('🎮 Experience started - Audio enabled');
    };

    return (
        <>
            {/* 🎮 LOADING & START SCREEN */}
            {!started && <LoadingScreen onStart={handleStart} />}

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
                    camera={{
                        position: [0, 20, -25],
                        fov: 60,
                    }}
                >
                    <color attach="background" args={['#ffb088']} />
                    {/* ← Pesca chiaro (era arancione scuro) */}
                    <Suspense fallback={null}>
                        <Physics gravity={[0, -20, 0]}>
                            <Experience />
                        </Physics>
                    </Suspense>
                </Canvas>
            </KeyboardControls>

            {/* Controlli Mobile */}
            <Joystick onMove={handleJoystickMove} />
            <JumpButton onJump={handleJump} />

            {/* 🎵 AUDIO - Fuori dal Canvas! */}
            <BackgroundMusic />
            <OceanSounds />
        </>
    );
}

export default App;
