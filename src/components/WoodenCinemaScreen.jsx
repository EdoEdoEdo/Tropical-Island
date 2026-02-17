import { useTexture } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// SCHERMO CINEMA IN LEGNO
export const WoodenCinemaScreen = ({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    imageUrl = null,
}) => {
    return (
        <group position={position} rotation={rotation}>
            {/* PALI LATERALI IN LEGNO */}
            <mesh position={[-4.4, 4, 0]} castShadow>
                <cylinderGeometry args={[0.24, 0.3, 8, 8]} />
                <meshStandardMaterial color="#8b6f47" roughness={0.9} />
            </mesh>

            {[1, 3, 5, 7].map((y, i) => (
                <mesh key={`left-ring-${i}`} position={[-4.4, y, 0]} castShadow>
                    <torusGeometry args={[0.26, 0.08, 8, 12]} />
                    <meshStandardMaterial color="#7a5f3a" roughness={0.95} />
                </mesh>
            ))}

            <mesh position={[4.4, 4, 0]} castShadow>
                <cylinderGeometry args={[0.24, 0.3, 8, 8]} />
                <meshStandardMaterial color="#8b6f47" roughness={0.9} />
            </mesh>

            {[1, 3, 5, 7].map((y, i) => (
                <mesh key={`right-ring-${i}`} position={[4.4, y, 0]} castShadow>
                    <torusGeometry args={[0.26, 0.08, 8, 12]} />
                    <meshStandardMaterial color="#7a5f3a" roughness={0.95} />
                </mesh>
            ))}

            {/* TRAVE SUPERIORE */}
            <mesh
                position={[0, 8, 0]}
                rotation={[0, 0, Math.PI / 2]}
                castShadow
            >
                <cylinderGeometry args={[0.2, 0.2, 9.6, 8]} />
                <meshStandardMaterial color="#8b6f47" roughness={0.9} />
            </mesh>

            {/* CORNICE LEGNO */}
            <mesh position={[0, 6.4, 0.05]} castShadow>
                <boxGeometry args={[8.8, 0.3, 0.2]} />
                <meshStandardMaterial color="#a0826d" roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.6, 0.05]} castShadow>
                <boxGeometry args={[8.8, 0.3, 0.2]} />
                <meshStandardMaterial color="#a0826d" roughness={0.85} />
            </mesh>
            <mesh position={[-4.4, 4, 0.05]} castShadow>
                <boxGeometry args={[0.3, 4.8, 0.2]} />
                <meshStandardMaterial color="#a0826d" roughness={0.85} />
            </mesh>
            <mesh position={[4.4, 4, 0.05]} castShadow>
                <boxGeometry args={[0.3, 4.8, 0.2]} />
                <meshStandardMaterial color="#a0826d" roughness={0.85} />
            </mesh>

            {/* TELO FRONTE */}
            <mesh position={[0, 4, 0.08]} receiveShadow>
                <planeGeometry args={[8, 4.4]} />
                <meshStandardMaterial
                    color="#f5f5dc"
                    roughness={0.8}
                    emissive="#ffffff"
                    emissiveIntensity={0.15}
                    side={THREE.FrontSide}
                />
            </mesh>

            {/* TELO RETRO */}
            <mesh position={[0, 4, -0.08]} receiveShadow>
                <planeGeometry args={[8, 4.4]} />
                <meshStandardMaterial
                    color="#f5f5dc"
                    roughness={0.8}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* CONTENUTO PROIETTATO */}
            {imageUrl?.endsWith('.mp4') && <VideoScreen videoUrl={imageUrl} />}
            {imageUrl && !imageUrl.endsWith('.mp4') && (
                <ImageScreen imageUrl={imageUrl} />
            )}

            {/* LUCI */}
            <pointLight
                position={[-5, 7, 1]}
                intensity={0.5}
                distance={12}
                color="#ffd700"
                castShadow
            />
            <pointLight
                position={[5, 7, 1]}
                intensity={0.5}
                distance={12}
                color="#ffd700"
                castShadow
            />
        </group>
    );
};

// IMMAGINE
const ImageScreen = ({ imageUrl }) => {
    const texture = useTexture(imageUrl);
    return (
        <mesh position={[0, 4, 0.091]}>
            <planeGeometry args={[7.6, 4]} />
            <meshStandardMaterial
                map={texture}
                emissive="#ffffff"
                emissiveIntensity={0.08}
                roughness={0.9}
                metalness={0}
                toneMapped={false}
            />
        </mesh>
    );
};

// VIDEO
const VideoScreen = ({ videoUrl }) => {
    const textureRef = useRef();

    useEffect(() => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.loop = true;
        video.muted = true; // necessario per autoplay
        video.playsInline = true;
        video.autoplay = true;
        video.play();

        const texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;

        textureRef.current = texture;

        return () => {
            video.pause();
            texture.dispose();
        };
    }, [videoUrl]);

    if (!textureRef.current) return null;

    return (
        <mesh position={[0, 4, 0.091]}>
            <planeGeometry args={[7.6, 4]} />
            <meshStandardMaterial
                map={textureRef.current}
                emissive="#ffffff"
                emissiveIntensity={0.15}
                roughness={0.8}
                metalness={0}
                toneMapped={false}
            />
        </mesh>
    );
};

// CINEMA COMPLETO PER SEZIONE
export const CinemaSection = ({ sectionPosition, imageUrl = null }) => {
    const angle = Math.atan2(sectionPosition[2], sectionPosition[0]);
    const rotation = [0, angle + Math.PI, 0];

    return (
        <WoodenCinemaScreen
            position={[sectionPosition[0], 0, sectionPosition[2]]}
            rotation={rotation}
            imageUrl={imageUrl}
        />
    );
};
