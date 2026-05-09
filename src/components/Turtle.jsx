import { useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

/**
 * Tartaruga statica (decorativa, sulla sabbia).
 */
export const Turtle = ({
    position = [35, 1.5, 25],
    rotation = 0,
    scale = 0.01,
}) => {
    const { scene } = useGLTF('models/Turtle.glb');
    const rot = Array.isArray(rotation) ? rotation : [0, rotation, 0];
    return (
        <RigidBody
            type="fixed"
            position={position}
            rotation={rot}
            colliders={false}
            name="turtle"
        >
            {/* Carapace + corpo: cubo basso e largo, partendo dal terreno */}
            <CuboidCollider args={[2.2, 1.4, 1.7]} position={[0, 0.3, 0]} />
            <primitive object={scene} scale={scale} />
        </RigidBody>
    );
};

useGLTF.preload('models/Turtle.glb');
