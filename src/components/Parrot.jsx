import { useGLTF } from '@react-three/drei';

/**
 * Pappagallo statico (decorativo).
 */
export const Parrot = ({
    position = [6, 8, 6],
    rotation = 0,
    scale = 0.012,
}) => {
    const { scene } = useGLTF('models/Parrot.glb');
    const rot = Array.isArray(rotation) ? rotation : [0, rotation, 0];
    return (
        <group position={position} rotation={rot} scale={scale}>
            <primitive object={scene} />
        </group>
    );
};

useGLTF.preload('models/Parrot.glb');
