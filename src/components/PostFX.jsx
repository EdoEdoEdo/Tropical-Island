import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from './useStore';

/**
 * Effetti post-processing applicati alla scena.
 * Controllati dal toggle `postFX` nello store.
 * - Bloom: risalta highlights del tramonto / video del cinema
 * - Vignette: scurisce gli angoli per effetto cinematografico
 */
export function PostFX() {
    const enabled = useStore((s) => s.postFX);
    if (!enabled) return null;

    return (
        <EffectComposer multisampling={0} disableNormalPass>
            <Bloom
                intensity={0.45}
                luminanceThreshold={0.85}
                luminanceSmoothing={0.3}
                mipmapBlur
            />
            <Vignette
                offset={0.4}
                darkness={0.25}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}
