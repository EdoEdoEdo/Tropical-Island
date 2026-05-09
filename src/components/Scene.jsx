import {
    AdaptiveDpr,
    AdaptiveEvents,
    PerformanceMonitor,
} from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { useState } from 'react';
import { Experience } from './Experience';
import { PostFX } from './PostFX';

/**
 * Scena 3D + physics, isolata in un chunk separato (lazy-loaded da App).
 * Include adaptive performance e postprocessing pipeline.
 */
export default function Scene() {
    const [, setDegraded] = useState(false);

    return (
        <PerformanceMonitor onDecline={() => setDegraded(true)} flipflops={3}>
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <Physics gravity={[0, -20, 0]}>
                <Experience />
            </Physics>
            <PostFX />
        </PerformanceMonitor>
    );
}
