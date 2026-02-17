import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useAnimations } from '@react-three/drei';

// 👤 CHARACTER con Ombre Abilitate
export const Character = ({
    scale = 1,
    color = '#4a90e2',
    name = 'Character',
    animation,
    ...props
}) => {
    // Carica modello character
    const { scene, animations } = useGLTF('models/Character.glb');
    const { actions } = useAnimations(animations, scene);

    // Abilita ombre su tutti i mesh
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Applica colore se disponibile
                    if (child.material && color) {
                        child.material.color.set(color);
                    }
                }
            });
        }
    }, [scene, color]);

    // Gestione animazioni
    useEffect(() => {
        if (actions && animation && actions[animation]) {
            // Stop tutte le animazioni
            Object.values(actions).forEach((action) => action?.stop());
            // Avvia quella richiesta
            actions[animation]?.play();
        }
    }, [actions, animation]);

    return <primitive object={scene} scale={scale} {...props} />;
};

// Preload
useGLTF.preload('models/Character.glb');
