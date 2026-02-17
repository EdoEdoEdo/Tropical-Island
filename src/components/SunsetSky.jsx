import { useRef } from 'react';
import { BackSide } from 'three';

// SUNSET SKY - Cielo sfumato tramonto (arancione → viola)
export const SunsetSky = () => {
    const skyRef = useRef();

    // Vertex Shader - Passa coordinate
    const vertexShader = `
        varying vec3 vWorldPosition;
        
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // Fragment Shader - Gradiente tramonto
    const fragmentShader = `
        uniform vec3 topColor;
        uniform vec3 middleColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        
        varying vec3 vWorldPosition;
        
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            
            // Gradiente a 3 colori: basso (arancione) → medio (rosa) → alto (viola)
            vec3 color;
            
            if (h < 0.5) {
                // Transizione basso → medio
                float t = h / 0.5;
                color = mix(bottomColor, middleColor, smoothstep(0.0, 1.0, t));
            } else {
                // Transizione medio → alto
                float t = (h - 0.5) / 0.5;
                color = mix(middleColor, topColor, smoothstep(0.0, 1.0, t));
            }
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const uniforms = {
        topColor: { value: [0.3, 0.2, 0.5] }, // Viola chiaro (era più scuro)
        middleColor: { value: [1.0, 0.6, 0.7] }, // Rosa salmone (era più rosso)
        bottomColor: { value: [1.0, 0.7, 0.5] }, // Pesca chiaro (era arancione forte)
        offset: { value: 33 },
        exponent: { value: 0.6 },
    };

    return (
        <mesh ref={skyRef}>
            <sphereGeometry args={[500, 32, 32]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                side={BackSide}
                depthWrite={false}
            />
        </mesh>
    );
};
