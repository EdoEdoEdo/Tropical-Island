import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Color } from 'three';
import { dayNightState } from './dayNightState';

const IS_MOBILE =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches ||
        window.innerWidth < 768);
const SHADOW_SIZE = IS_MOBILE ? 1024 : 2048;

// Distanza sole/luna dal centro scena
const ORBIT_RADIUS = 130;

// Keyframes coordinati con SunsetSky.
// time: 0=midday, 0.25=sunset, 0.5=night, 0.75=dawn
const SUN_KEYFRAMES = [
    {
        t: 0.0,
        sunInt: 2.6,
        sunColor: '#fff5d6',
        ambInt: 0.7,
        ambColor: '#cfe6f0',
        hemiInt: 1.0,
    },
    {
        t: 0.25,
        sunInt: 2.0,
        sunColor: '#ffaa66',
        ambInt: 0.55,
        ambColor: '#ffd4a8',
        hemiInt: 0.85,
    },
    {
        t: 0.5,
        sunInt: 0.0,
        sunColor: '#1a3a66',
        ambInt: 0.18,
        ambColor: '#3a4a7a',
        hemiInt: 0.3,
    },
    {
        t: 0.75,
        sunInt: 1.4,
        sunColor: '#ffc18a',
        ambInt: 0.5,
        ambColor: '#ffd0b0',
        hemiInt: 0.75,
    },
    {
        t: 1.0,
        sunInt: 2.6,
        sunColor: '#fff5d6',
        ambInt: 0.7,
        ambColor: '#cfe6f0',
        hemiInt: 1.0,
    },
];

const cA = new Color();
const cB = new Color();
const sample = {
    sunInt: 0,
    sunColor: new Color(),
    ambInt: 0,
    ambColor: new Color(),
    hemiInt: 0,
};

function sampleLight(time) {
    for (let i = 0; i < SUN_KEYFRAMES.length - 1; i++) {
        const a = SUN_KEYFRAMES[i];
        const b = SUN_KEYFRAMES[i + 1];
        if (time >= a.t && time <= b.t) {
            const k = (time - a.t) / (b.t - a.t);
            sample.sunInt = a.sunInt + (b.sunInt - a.sunInt) * k;
            sample.ambInt = a.ambInt + (b.ambInt - a.ambInt) * k;
            sample.hemiInt = a.hemiInt + (b.hemiInt - a.hemiInt) * k;
            cA.set(a.sunColor);
            cB.set(b.sunColor);
            sample.sunColor.lerpColors(cA, cB, k);
            cA.set(a.ambColor);
            cB.set(b.ambColor);
            sample.ambColor.lerpColors(cA, cB, k);
            return;
        }
    }
}

// Posizione sole sull'orbita.
// Convenzione: +X = Est, +Z = Nord. Il sole sorge a Est e tramonta a Ovest.
//   t=0    midday  -> zenith
//   t=0.25 sunset  -> orizzonte Ovest (-X)
//   t=0.5  night   -> nadir
//   t=0.75 dawn    -> orizzonte Est  (+X)
function getSunPosition(t, out) {
    const a = t * Math.PI * 2;
    out.x = -Math.sin(a) * ORBIT_RADIUS;
    out.y = Math.cos(a) * ORBIT_RADIUS;
    out.z = -30;
}

const _sunPos = { x: 0, y: 0, z: 0 };
const _moonColor = new Color('#cfd8e8');

export const SunsetLighting = () => {
    const sunLightRef = useRef();
    const moonLightRef = useRef();
    const ambRef = useRef();
    const hemiRef = useRef();
    const sunMeshRef = useRef();
    const moonMeshRef = useRef();
    const sunMatRef = useRef();
    const moonMatRef = useRef();

    // Materiali emissive iniziali
    const initialColors = useMemo(
        () => ({
            sun: new Color('#fff5d6'),
            moon: new Color('#e8eef8'),
        }),
        [],
    );

    useFrame(() => {
        const t = dayNightState.time;
        sampleLight(t);

        // Posizione sole/luna (luna sempre opposta)
        getSunPosition(t, _sunPos);
        const sunAboveHorizon = _sunPos.y > -10;

        // Pubblica direzione/colore sole per acqua reflective
        const sunLen =
            Math.sqrt(
                _sunPos.x * _sunPos.x +
                    _sunPos.y * _sunPos.y +
                    _sunPos.z * _sunPos.z,
            ) || 1;
        dayNightState.sunDir.x = _sunPos.x / sunLen;
        dayNightState.sunDir.y = _sunPos.y / sunLen;
        dayNightState.sunDir.z = _sunPos.z / sunLen;
        dayNightState.sunColor.r = sample.sunColor.r;
        dayNightState.sunColor.g = sample.sunColor.g;
        dayNightState.sunColor.b = sample.sunColor.b;
        // 0..1 quanto è alto: max a midday, 0 sotto orizzonte
        dayNightState.sunAbove = Math.max(0, Math.min(1, _sunPos.y / 80));

        // SOLE
        if (sunLightRef.current) {
            sunLightRef.current.position.set(_sunPos.x, _sunPos.y, _sunPos.z);
            sunLightRef.current.intensity = sunAboveHorizon ? sample.sunInt : 0;
            sunLightRef.current.color.copy(sample.sunColor);
        }
        if (sunMeshRef.current) {
            sunMeshRef.current.position.set(_sunPos.x, _sunPos.y, _sunPos.z);
            sunMeshRef.current.visible = _sunPos.y > -20;
        }
        if (sunMatRef.current) {
            sunMatRef.current.color.copy(sample.sunColor);
            sunMatRef.current.emissive.copy(sample.sunColor);
            sunMatRef.current.emissiveIntensity = Math.max(
                0.4,
                sample.sunInt * 0.6,
            );
            sunMatRef.current.opacity = sunAboveHorizon ? 1 : 0.3;
        }

        // LUNA (posizione opposta)
        const moonX = -_sunPos.x;
        const moonY = -_sunPos.y;
        const moonAboveHorizon = moonY > -10;

        if (moonLightRef.current) {
            moonLightRef.current.position.set(moonX, moonY, _sunPos.z);
            // Luce lunare blanda solo quando sole è basso
            const moonInt = moonAboveHorizon
                ? Math.max(0, 0.4 - sample.sunInt * 0.15)
                : 0;
            moonLightRef.current.intensity = moonInt;
        }
        if (moonMeshRef.current) {
            moonMeshRef.current.position.set(moonX, moonY, _sunPos.z);
            moonMeshRef.current.visible = moonY > -20;
        }
        if (moonMatRef.current) {
            // Luna più visibile di notte
            const visibility = moonAboveHorizon ? 1 : 0.2;
            moonMatRef.current.opacity = visibility;
            moonMatRef.current.emissiveIntensity = moonAboveHorizon ? 0.9 : 0.2;
        }

        if (ambRef.current) {
            ambRef.current.intensity = sample.ambInt;
            ambRef.current.color.copy(sample.ambColor);
        }
        if (hemiRef.current) {
            hemiRef.current.intensity = sample.hemiInt;
        }
    });

    return (
        <group>
            {/* Directional SOLE - proietta ombre */}
            <directionalLight
                ref={sunLightRef}
                position={[0, ORBIT_RADIUS, -30]}
                intensity={2.6}
                color="#fff5d6"
                castShadow
                shadow-mapSize-width={SHADOW_SIZE}
                shadow-mapSize-height={SHADOW_SIZE}
                shadow-camera-near={1}
                shadow-camera-far={300}
                shadow-camera-left={-80}
                shadow-camera-right={80}
                shadow-camera-top={80}
                shadow-camera-bottom={-80}
                shadow-bias={-0.0005}
            />

            {/* Directional LUNA - luce soffusa, niente ombre per perf */}
            <directionalLight
                ref={moonLightRef}
                position={[0, -ORBIT_RADIUS, -30]}
                intensity={0}
                color="#aab8d6"
            />

            {/* Mesh visibile SOLE */}
            <mesh ref={sunMeshRef} frustumCulled={false}>
                <sphereGeometry args={[6, 24, 24]} />
                <meshStandardMaterial
                    ref={sunMatRef}
                    color={initialColors.sun}
                    emissive={initialColors.sun}
                    emissiveIntensity={1.5}
                    transparent
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            {/* Mesh visibile LUNA */}
            <mesh ref={moonMeshRef} frustumCulled={false}>
                <sphereGeometry args={[4, 24, 24]} />
                <meshStandardMaterial
                    ref={moonMatRef}
                    color={initialColors.moon}
                    emissive={_moonColor}
                    emissiveIntensity={0.9}
                    transparent
                    depthWrite={false}
                    toneMapped={false}
                />
            </mesh>

            <hemisphereLight
                ref={hemiRef}
                intensity={1.0}
                color="#cfe6f0"
                groundColor="#7a6450"
            />

            <ambientLight ref={ambRef} intensity={0.7} color="#cfe6f0" />

            {/* Bonfire fill light (sempre attivo, intensità bassa) */}
            <pointLight
                position={[26, 5, 0]}
                intensity={0.6}
                color="#ffa07a"
                distance={50}
                decay={2}
            />
        </group>
    );
};
