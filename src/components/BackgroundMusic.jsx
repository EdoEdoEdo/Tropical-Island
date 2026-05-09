import { useEffect, useRef } from 'react';
import { useStore } from './useStore';

// BACKGROUND MUSIC - HTML5 Audio (fuori dal Canvas!)
export const BackgroundMusic = () => {
    const audioRef = useRef();
    const hasStartedRef = useRef(false);
    const audioEnabled = useStore((state) => state.audioEnabled);

    useEffect(() => {
        // Crea audio element
        audioRef.current = new Audio('sounds/ambient-music.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.2;

        if (import.meta.env.DEV) console.log('🎵 Audio element created');

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
                    if (import.meta.env.DEV) console.log('✅ Musica partita!');
                    hasStartedRef.current = true;
                })
                .catch(() => {
                    if (import.meta.env.DEV) {
                        console.log(
                            '⚠️ Autoplay bloccato, clicca sulla pagina',
                        );
                    }

                    // Handler per primo click
                    const handleClick = () => {
                        if (audioRef.current && audioEnabled) {
                            audioRef.current
                                .play()
                                .then(() => {
                                    if (import.meta.env.DEV) {
                                        console.log(
                                            '✅ Musica partita dopo click!',
                                        );
                                    }
                                    hasStartedRef.current = true;
                                })
                                .catch((e) => {
                                    if (import.meta.env.DEV) {
                                        console.error('❌ Play failed:', e);
                                    }
                                });
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
