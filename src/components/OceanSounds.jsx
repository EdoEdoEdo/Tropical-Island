import { useEffect, useRef } from 'react';
import { useStore } from './useStore';

// OCEAN SOUNDS - HTML5 Audio (fuori dal Canvas!)
export const OceanSounds = () => {
    const audioRef = useRef();
    const hasStartedRef = useRef(false);
    const audioEnabled = useStore((state) => state.audioEnabled);

    useEffect(() => {
        // Crea audio element
        audioRef.current = new Audio('sounds/ocean-waves.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;

        console.log('🌊 Ocean audio element created');

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;

        if (audioEnabled && !hasStartedRef.current) {
            // Prova a partire
            audioRef.current
                .play()
                .then(() => {
                    console.log('✅ Onde partite!');
                    hasStartedRef.current = true;
                })
                .catch((err) => {
                    console.log(
                        '⚠️ Autoplay onde bloccato, clicca sulla pagina',
                    );

                    // Handler per primo click
                    const handleClick = () => {
                        if (audioRef.current && audioEnabled) {
                            audioRef.current
                                .play()
                                .then(() => {
                                    console.log('✅ Onde partite dopo click!');
                                    hasStartedRef.current = true;
                                })
                                .catch((e) =>
                                    console.error('❌ Ocean play failed:', e),
                                );
                        }
                        document.removeEventListener('click', handleClick);
                    };

                    document.addEventListener('click', handleClick);
                });
        } else if (!audioEnabled && hasStartedRef.current) {
            audioRef.current.pause();
            hasStartedRef.current = false;
        }
    }, [audioEnabled]);

    // Questo componente non renderizza nulla!
    return null;
};
