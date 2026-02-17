import { RigidBody } from '@react-three/rapier';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from './useStore';

// COASTAL TERRAIN - Procedural (No GLB!)
export const CoastalTerrain = () => {
    const materialRef = useRef();
    const timeRef = useRef(0);

    // Get values from store
    const waterLevel = useStore((state) => state.waterLevel);
    const waveSpeed = useStore((state) => state.waveSpeed);
    const waveAmplitude = useStore((state) => state.waveAmplitude);
    const foamDepth = useStore((state) => state.foamDepth);

    // Create procedural island geometry
    const geometry = useMemo(() => {
        const size = 200; // ← DIMENSIONE ISOLA (200 = metà di 400)
        const segments = 128;
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);

        const positions = geo.attributes.position.array;

        // Create island shape with elevation
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            // Distance from center
            const distance = Math.sqrt(x * x + y * y);
            const radius = size / 2;

            // Island elevation profile
            let height = 0;

            if (distance < radius * 0.7) {
                // Center island - elevated
                const centerFactor = 1 - distance / (radius * 0.7);
                height = Math.pow(centerFactor, 1.5) * 6.0; // ← ALTEZZA CENTRO (4m)

                // Add gentle noise
                const noiseX = Math.sin(x * 0.15) * Math.cos(y * 0.15);
                const noiseY = Math.cos(x * 0.12) * Math.sin(y * 0.18);
                height += (noiseX + noiseY) * 0.3;
            } else if (distance < radius) {
                // Beach transition
                const beachFactor =
                    1 - (distance - radius * 0.7) / (radius * 0.3);
                height = beachFactor * 0.5; // ← ALTEZZA SPIAGGIA (0.5m)
            }

            positions[i + 2] = height;
        }

        geo.attributes.position.needsUpdate = true;
        geo.computeVertexNormals();

        return geo;
    }, []);

    // Shader injection
    const onBeforeCompile = (shader) => {
        // Add custom uniforms
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uWaterLevel = { value: waterLevel };
        shader.uniforms.uWaveSpeed = { value: waveSpeed };
        shader.uniforms.uWaveAmplitude = { value: waveAmplitude };
        shader.uniforms.uFoamDepth = { value: foamDepth };
        shader.uniforms.uGrassColor = { value: new THREE.Color('#85a02b') };
        shader.uniforms.uUnderwaterColor = {
            value: new THREE.Color('#118a4f'),
        };

        // Store reference
        materialRef.current.userData.shader = shader;

        // Vertex Shader
        shader.vertexShader = `
            varying vec3 vWorldPosition;
            ${shader.vertexShader}
        `.replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
            vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
        );

        // Fragment Shader
        shader.fragmentShader = `
            uniform float uTime;
            uniform float uWaterLevel;
            uniform float uWaveSpeed;
            uniform float uWaveAmplitude;
            uniform float uFoamDepth;
            uniform vec3 uGrassColor;
            uniform vec3 uUnderwaterColor;
            
            varying vec3 vWorldPosition;
            ${shader.fragmentShader}
        `.replace(
            `#include <color_fragment>`,
            `#include <color_fragment>
            
            // Base color (sand)
            vec3 baseColor = diffuseColor.rgb;

            // Darken at lower Y (wet sand effect)
            float heightFactor = smoothstep(uWaterLevel + 1.0, uWaterLevel, vWorldPosition.y);
            baseColor = mix(baseColor, baseColor * 0.5, heightFactor);
            
            // Underwater color blend
            float oceanFactor = smoothstep(min(uWaterLevel - 0.4, 0.2), 0.0, vWorldPosition.y);
            baseColor = mix(baseColor, uUnderwaterColor, oceanFactor);

            // Grass on higher areas
            float grassFactor = smoothstep(uWaterLevel + 0.8, max(uWaterLevel + 1.6, 3.0), vWorldPosition.y);
            baseColor = mix(baseColor, uGrassColor, grassFactor);
            
            // Foam Effect - synchronized with waves
            float sineOffset = sin(uTime * uWaveSpeed) * uWaveAmplitude;
            float currentWaterHeight = uWaterLevel + sineOffset;

            float stripe = smoothstep(currentWaterHeight + 0.01, currentWaterHeight - 0.01, vWorldPosition.y)
                         - smoothstep(currentWaterHeight + uFoamDepth + 0.01, currentWaterHeight + uFoamDepth - 0.01, vWorldPosition.y);

            vec3 stripeColor = vec3(1.0);

            // Apply foam
            vec3 finalColor = mix(baseColor - stripe, stripeColor, stripe);
            
            diffuseColor.rgb = finalColor;
            `,
        );
    };

    // Update uniforms
    useEffect(() => {
        if (materialRef.current?.userData?.shader) {
            const shader = materialRef.current.userData.shader;
            shader.uniforms.uWaterLevel.value = waterLevel;
            shader.uniforms.uWaveSpeed.value = waveSpeed;
            shader.uniforms.uWaveAmplitude.value = waveAmplitude;
            shader.uniforms.uFoamDepth.value = foamDepth;
        }
    }, [waterLevel, waveSpeed, waveAmplitude, foamDepth]);

    // Animation
    useFrame((state, delta) => {
        if (materialRef.current?.userData?.shader) {
            timeRef.current += delta;
            materialRef.current.userData.shader.uniforms.uTime.value =
                timeRef.current;
        }
    });

    return (
        <RigidBody type="fixed" colliders="trimesh" name="coastal-terrain">
            <mesh
                geometry={geometry}
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
                castShadow
            >
                <meshStandardMaterial
                    ref={materialRef}
                    color="#ff9900" // Sand color
                    roughness={0.9}
                    metalness={0.1}
                    onBeforeCompile={onBeforeCompile}
                />
            </mesh>
        </RigidBody>
    );
};
