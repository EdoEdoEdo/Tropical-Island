import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color } from 'three';
import { dayNightState } from './dayNightState';

// Ciclo realistico (NO viola): notte blu → alba rosa-oro → giorno azzurro → tramonto caldo
// time mapping:
//   0.00 = midday   azzurro pieno
//   0.25 = sunset   rosa-arancio caldo
//   0.50 = night    blu profondo
//   0.75 = dawn     rosa-arancio tenue
//   1.00 = midday   (loop)
const SKY_KEYFRAMES = [
    // midday - azzurro caraibico vivido (saturazione alta)
    {
        t: 0.0,
        top: '#0d6efd',
        middle: '#29b6ff',
        bottom: '#7fdfff',
    },
    // sunset - oro/arancio caldo saturo
    {
        t: 0.25,
        top: '#0d47a1',
        middle: '#ff7043',
        bottom: '#ffb74d',
    },
    // night - blu notte profondo
    {
        t: 0.5,
        top: '#040a30',
        middle: '#101e55',
        bottom: '#1f3168',
    },
    // dawn - rosa-pesca acceso
    {
        t: 0.75,
        top: '#283593',
        middle: '#ff8a5b',
        bottom: '#ffc78a',
    },
    // midday (loop)
    {
        t: 1.0,
        top: '#0d6efd',
        middle: '#29b6ff',
        bottom: '#7fdfff',
    },
];

const tmpA = new Color();
const tmpB = new Color();

function sampleSky(time, target) {
    for (let i = 0; i < SKY_KEYFRAMES.length - 1; i++) {
        const a = SKY_KEYFRAMES[i];
        const b = SKY_KEYFRAMES[i + 1];
        if (time >= a.t && time <= b.t) {
            const k = (time - a.t) / (b.t - a.t);
            tmpA.set(a.top);
            tmpB.set(b.top);
            target.top.lerpColors(tmpA, tmpB, k);
            tmpA.set(a.middle);
            tmpB.set(b.middle);
            target.middle.lerpColors(tmpA, tmpB, k);
            tmpA.set(a.bottom);
            tmpB.set(b.bottom);
            target.bottom.lerpColors(tmpA, tmpB, k);
            return;
        }
    }
}

const vertexShader = /* glsl */ `
    varying vec3 vWorldPosition;
    void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = /* glsl */ `
    uniform vec3 topColor;
    uniform vec3 middleColor;
    uniform vec3 bottomColor;
    uniform float offset;
    varying vec3 vWorldPosition;
    void main() {
        float h = normalize(vWorldPosition + offset).y;
        vec3 color;
        if (h < 0.5) {
            float t = h / 0.5;
            color = mix(bottomColor, middleColor, smoothstep(0.0, 1.0, t));
        } else {
            float t = (h - 0.5) / 0.5;
            color = mix(middleColor, topColor, smoothstep(0.0, 1.0, t));
        }
        gl_FragColor = vec4(color, 1.0);
    }
`;

const sample = { top: new Color(), middle: new Color(), bottom: new Color() };

export const SunsetSky = () => {
    const matRef = useRef();

    const uniforms = useMemo(
        () => ({
            topColor: { value: new Color('#3a7fb8') },
            middleColor: { value: new Color('#7fb8d9') },
            bottomColor: { value: new Color('#cfe6f0') },
            offset: { value: 33 },
        }),
        [],
    );

    useFrame(() => {
        sampleSky(dayNightState.time, sample);
        uniforms.topColor.value.copy(sample.top);
        uniforms.middleColor.value.copy(sample.middle);
        uniforms.bottomColor.value.copy(sample.bottom);

        // Pubblica i colori del cielo per fog / water reflection
        dayNightState.horizon.r = sample.bottom.r;
        dayNightState.horizon.g = sample.bottom.g;
        dayNightState.horizon.b = sample.bottom.b;
        dayNightState.skyMiddle.r = sample.middle.r;
        dayNightState.skyMiddle.g = sample.middle.g;
        dayNightState.skyMiddle.b = sample.middle.b;
        dayNightState.skyTop.r = sample.top.r;
        dayNightState.skyTop.g = sample.top.g;
        dayNightState.skyTop.b = sample.top.b;
    });

    return (
        <mesh>
            <sphereGeometry args={[500, 32, 32]} />
            <shaderMaterial
                ref={matRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                side={BackSide}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
};
