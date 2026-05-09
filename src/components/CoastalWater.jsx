import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from './useStore';
import { dayNightState } from './dayNightState';

// 🌊 COASTAL WATER — Stylized water con caustics e raccordo orizzonte.
// I colori vengono tinti dinamicamente verso il colore del cielo
// per evitare lo "stacco netto" cielo/mare.
export const CoastalWater = ({ position = [0, 0.9, 0], size = 400 }) => {
    const oceanRef = useRef();
    const timeRef = useRef(0);

    const waveSpeed = useStore((state) => state.waveSpeed);
    const waveAmplitude = useStore((state) => state.waveAmplitude);

    const perlinNoise = `
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m; m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
    `;

    const vertexShader = `
        uniform float uTime;
        uniform float uWaveSpeed;
        uniform float uWaveAmplitude;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
            vUv = uv;
            vec3 pos = position;
            float sineOffset = sin(uTime * uWaveSpeed) * uWaveAmplitude;
            pos.z += sineOffset;
            vec4 wp = modelMatrix * vec4(pos, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
        }
    `;

    const fragmentShader = `
        ${perlinNoise}
        uniform float uTime;
        uniform vec3 uColorNear;
        uniform vec3 uColorFar;
        uniform vec3 uHorizonColor;
        uniform vec3 uSkyMiddle;
        uniform vec3 uSkyTop;
        uniform vec3 uSunDir;
        uniform vec3 uSunColor;
        uniform float uSunAbove;
        uniform vec3 uCameraPos;
        uniform float uTextureSize;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Caustics: sovrapposizione di 2 noise scrolling
        float caustics(vec2 uv, float t) {
            float n1 = snoise(uv * 8.0 + vec2(t * 0.15, t * 0.1));
            float n2 = snoise(uv * 12.0 - vec2(t * 0.1, t * 0.18));
            float c = pow(max(0.0, 1.0 - abs(n1 + n2) * 0.5), 4.0);
            return c;
        }

        // Sample sky color along a direction (h = dir.y)
        vec3 sampleSky(float h) {
            h = clamp(h, 0.0, 1.0);
            if (h < 0.5) {
                return mix(uHorizonColor, uSkyMiddle, smoothstep(0.0, 1.0, h / 0.5));
            }
            return mix(uSkyMiddle, uSkyTop, smoothstep(0.0, 1.0, (h - 0.5) / 0.5));
        }

        void main() {
            vec3 finalColor = uColorNear;

            float textureSize = 100.0 - uTextureSize;
            float noiseBase = snoise(vUv * (textureSize * 2.8) + sin(uTime * 0.3));
            noiseBase = noiseBase * 0.5 + 0.5;
            vec3 colorBase = vec3(noiseBase);

            vec3 foam = smoothstep(0.08, 0.001, colorBase);
            foam = step(0.5, foam);

            float noiseWaves = snoise(vUv * textureSize + sin(uTime * -0.1));
            noiseWaves = noiseWaves * 0.5 + 0.5;
            vec3 colorWaves = vec3(noiseWaves);
            float threshold = 0.6 + 0.01 * sin(uTime * 2.0);
            vec3 waveEffect = 1.0 - (smoothstep(threshold + 0.03, threshold + 0.032, colorWaves) +
                                    smoothstep(threshold, threshold - 0.01, colorWaves));
            waveEffect = step(0.5, waveEffect);

            vec3 combinedEffect = min(waveEffect + foam, 1.0);

            // Distanza dal centro per gradient profondità
            float distFromCenter = length(vUv - 0.5);
            float vignette = distFromCenter * 1.5;
            vec3 baseEffect = smoothstep(0.1, 0.3, vec3(vignette));
            vec3 baseColor = mix(finalColor, uColorFar, baseEffect);

            combinedEffect = mix(combinedEffect, vec3(0.0), baseEffect);
            vec3 foamEffect = mix(foam, vec3(0.0), baseEffect);
            finalColor = (1.0 - combinedEffect) * baseColor + combinedEffect;

            // CAUSTICS - solo in shallow water
            float shallowMask = 1.0 - smoothstep(0.05, 0.18, distFromCenter);
            float c = caustics(vUv * 8.0, uTime);
            finalColor += vec3(0.4, 0.55, 0.45) * c * shallowMask * 0.5;

            // ===== FAKE SKY REFLECTION =====
            // Direzione verso camera nello spazio mondo
            vec3 viewDir = normalize(uCameraPos - vWorldPos);
            // Normale dell'acqua leggermente perturbata da onde (per riflesso "rotto")
            float nx = snoise(vUv * 30.0 + uTime * 0.2) * 0.08;
            float nz = snoise(vUv * 30.0 - uTime * 0.15) * 0.08;
            vec3 normal = normalize(vec3(nx, 1.0, nz));
            // Direzione raggio riflesso (eye→frag riflesso sulla normale)
            vec3 incoming = -viewDir;
            vec3 reflectDir = reflect(incoming, normal);
            // Sky color in quella direzione
            vec3 skyRefl = sampleSky(reflectDir.y);
            // Sun glint: glossy lobe attorno alla direzione del sole
            float sunDot = max(0.0, dot(reflectDir, normalize(uSunDir)));
            float glint = pow(sunDot, 180.0) * 2.5 + pow(sunDot, 32.0) * 0.4;
            vec3 sunRefl = uSunColor * glint * uSunAbove;
            // Fresnel: più riflesso a grazing angle (camera bassa) e meno guardando giù
            float fresnel = pow(1.0 - max(0.0, viewDir.y), 4.0);
            // Mix riflesso (più forte lontano dalla riva, meno sulla shore)
            float reflMask = smoothstep(0.05, 0.25, distFromCenter);
            float reflStrength = mix(0.15, 0.55, fresnel) * reflMask;
            finalColor = mix(finalColor, skyRefl, reflStrength);
            finalColor += sunRefl * reflMask;

            // RACCORDO ORIZZONTE: fade morbido verso il colore cielo
            float horizonFade = smoothstep(0.25, 0.5, distFromCenter);
            finalColor = mix(finalColor, uHorizonColor, horizonFade * 0.7);

            float alpha = mix(0.4, 1.0, foamEffect.r);
            alpha = mix(alpha, 1.0, vignette + 0.5);

            gl_FragColor = vec4(finalColor, alpha);
        }
    `;

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uWaveSpeed: { value: waveSpeed },
            uWaveAmplitude: { value: waveAmplitude },
            uColorNear: { value: new THREE.Color('#3ee0c0') },
            uColorFar: { value: new THREE.Color('#0095c2') },
            uHorizonColor: { value: new THREE.Color('#cfe6f0') },
            uSkyMiddle: { value: new THREE.Color('#7fb8d9') },
            uSkyTop: { value: new THREE.Color('#3a7fb8') },
            uSunDir: { value: new THREE.Vector3(0, 1, 0) },
            uSunColor: { value: new THREE.Color('#fff5d6') },
            uSunAbove: { value: 1 },
            uCameraPos: { value: new THREE.Vector3() },
            uTextureSize: { value: 45 },
        }),
        [],
    );

    useEffect(() => {
        uniforms.uWaveSpeed.value = waveSpeed;
        uniforms.uWaveAmplitude.value = waveAmplitude;
    }, [waveSpeed, waveAmplitude, uniforms]);

    useFrame((state, delta) => {
        if (!oceanRef.current) return;
        timeRef.current += delta;
        uniforms.uTime.value = timeRef.current;

        // Camera position per fake reflection
        uniforms.uCameraPos.value.copy(state.camera.position);

        // Tinta orizzonte = colore bottom del cielo (raccordo)
        uniforms.uHorizonColor.value.setRGB(
            dayNightState.horizon.r,
            dayNightState.horizon.g,
            dayNightState.horizon.b,
        );
        uniforms.uSkyMiddle.value.setRGB(
            dayNightState.skyMiddle.r,
            dayNightState.skyMiddle.g,
            dayNightState.skyMiddle.b,
        );
        uniforms.uSkyTop.value.setRGB(
            dayNightState.skyTop.r,
            dayNightState.skyTop.g,
            dayNightState.skyTop.b,
        );
        uniforms.uSunDir.value.set(
            dayNightState.sunDir.x,
            dayNightState.sunDir.y,
            dayNightState.sunDir.z,
        );
        uniforms.uSunColor.value.setRGB(
            dayNightState.sunColor.r,
            dayNightState.sunColor.g,
            dayNightState.sunColor.b,
        );
        uniforms.uSunAbove.value = dayNightState.sunAbove;

        // Tinta deep verso il colore cielo (più scuro di notte)
        const k = 0.35;
        uniforms.uColorFar.value.setRGB(
            0.18 + dayNightState.horizon.r * k,
            0.6 + dayNightState.horizon.g * k * 0.3,
            0.65 + dayNightState.horizon.b * k * 0.3,
        );
    });

    return (
        <mesh
            ref={oceanRef}
            position={position}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
        >
            <planeGeometry args={[size, size, 128, 128]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.FrontSide}
                toneMapped={false}
            />
        </mesh>
    );
};
