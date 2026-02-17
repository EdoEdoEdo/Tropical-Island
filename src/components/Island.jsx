import { useEffect } from 'react';
import { useControls } from 'leva';
import { useStore } from './useStore';
import { CoastalTerrain } from './CoastalTerrain';
import { CoastalWater } from './CoastalWater';
import { PalmTree } from './PalmTree';
import { OceanBarrier } from './OceanBarrier';
import { WoodenCinemaScreen } from './WoodenCinemaScreen';
import { Moai } from './Moai';
import { House } from './House';
import { Umbrella } from './Umbrella';
import { Table } from './Table';
import { ChaiseLounge } from './ChaiseLounge';
import { BeachChair } from './BeachChair';
import { SandCastle } from './SandCastle';
import { Crab } from './Crab';
import { Turtle } from './Turtle';
import { Rowboat } from './Rowboat';
import { Bonfire } from './Bonfire';
import { SurfboardOne } from './Surfboard-1';
import { SurfboardTwo } from './Surfboard-2';
import { Hammock } from './Hammock';
import { Parrot } from './Parrot';
import { Info } from './Info';
import { Grass } from './Grass';
import { Torch } from './Torch';
import { Grill } from './Grill';

// 🔧 DEV MODE - Imposta a false per produzione
const SHOW_LEVA_CONTROLS = false;

// 🏝️ ISOLA - Coastal World Style
export const Island = () => {
    // 🎛️ LEVA CONTROLS (solo in dev mode)
    const waterControls = SHOW_LEVA_CONTROLS
        ? useControls('🌊 Water', {
              waterLevel: {
                  value: 0.9,
                  min: 0.5,
                  max: 5.0,
                  step: 0.1,
                  label: 'Water Level',
              },
              waveSpeed: {
                  value: 1.0,
                  min: 0.5,
                  max: 2.0,
                  step: 0.1,
                  label: 'Wave Speed',
              },
              waveAmplitude: {
                  value: 0.1,
                  min: 0.05,
                  max: 0.5,
                  step: 0.05,
                  label: 'Wave Amplitude',
              },
              foamDepth: {
                  value: 0.15,
                  min: 0.05,
                  max: 0.5,
                  step: 0.05,
                  label: 'Foam Depth',
              },
          })
        : {
              // Valori default in produzione
              waterLevel: 0.9,
              waveSpeed: 1.0,
              waveAmplitude: 0.1,
              foamDepth: 0.15,
          };

    // 🔊 AUDIO RIMOSSO DA LEVA
    // Ora controllato da START button in LoadingScreen

    // 🗄️ SYNC LEVA → ZUSTAND (solo water controls)
    const store = useStore();

    useEffect(() => {
        store.setWaterLevel(waterControls.waterLevel);
        store.setWaveSpeed(waterControls.waveSpeed);
        store.setWaveAmplitude(waterControls.waveAmplitude);
        store.setFoamDepth(waterControls.foamDepth);
    }, [
        waterControls.waterLevel,
        waterControls.waveSpeed,
        waterControls.waveAmplitude,
        waterControls.foamDepth,
    ]);

    return (
        <group>
            {/* 🏝️ TERRENO COASTAL con Foam Shader */}
            <CoastalTerrain />

            {/* 🌊 OCEANO con Perlin Noise Pattern */}
            <CoastalWater position={[0, 0.9, 0]} size={800} />

            {/* 🌴 15 PALME GLB - Distribuite al centro, 3 varianti, con collisione */}
            {/* ANELLO INTERNO - 5 palme molto vicine al centro */}
            <PalmTree
                position={[8, 4.7, 5]}
                variant={1}
                scale={2.4}
                rotation={0.5}
            />
            <PalmTree
                position={[-6, 5, -8]}
                variant={2}
                scale={2.2}
                rotation={1.2}
            />
            <PalmTree
                position={[10, 5, -6]}
                variant={3}
                scale={2.6}
                rotation={2.1}
            />
            <PalmTree
                position={[-9, 4.5, 7]}
                variant={1}
                scale={2.0}
                rotation={0.8}
            />
            <PalmTree
                position={[5, 5, -10]}
                variant={2}
                scale={2.4}
                rotation={1.7}
            />

            {/* ANELLO MEDIO - 6 palme */}
            <PalmTree
                position={[15, 3.8, 10]}
                variant={3}
                scale={2.2}
                rotation={0.3}
            />
            <PalmTree
                position={[-14, 3.6, -12]}
                variant={1}
                scale={2.6}
                rotation={1.9}
            />
            <PalmTree
                position={[18, 3.9, -8]}
                variant={2}
                scale={2.0}
                rotation={2.5}
            />
            <PalmTree
                position={[-16, 3.7, 9]}
                variant={3}
                scale={2.4}
                rotation={0.6}
            />
            <PalmTree
                position={[12, 4.0, -15]}
                variant={1}
                scale={2.2}
                rotation={1.4}
            />
            <PalmTree
                position={[-10, 3.8, 14]}
                variant={2}
                scale={2.6}
                rotation={2.8}
            />

            {/* ANELLO ESTERNO - 4 palme verso il bordo */}
            <PalmTree
                position={[22, 3.0, 15]}
                variant={3}
                scale={2.0}
                rotation={0.9}
            />
            <PalmTree
                position={[-20, 2.9, -18]}
                variant={1}
                scale={2.4}
                rotation={1.6}
            />
            <PalmTree
                position={[25, 3.1, -12]}
                variant={2}
                scale={2.2}
                rotation={2.3}
            />
            <PalmTree
                position={[-23, 2.8, 16]}
                variant={3}
                scale={2.6}
                rotation={0.4}
            />

            {/* 🚧 BARRIERA OCEANO - Muro invisibile nel mare */}
            <OceanBarrier radius={65} height={5} />

            {/* 🎬 CINEMA SCREEN - Nord (guarda verso centro/sud) */}
            <WoodenCinemaScreen
                position={[0, 3, 25]}
                rotation={[0, Math.PI, 0]}
                imageUrl="video/video_small.mp4"
            />

            {/* 🪑 Sedute - Nord */}
            <BeachChair
                position={[-2, 5, 15]}
                rotation={Math.PI / 9}
                scale={0.01}
            />
            <ChaiseLounge
                position={[1, 4.5, 15]}
                rotation={Math.PI / 1.8}
                scale={20}
            />

            {/* 🏰 Castello di Sabbia - Nord */}
            <SandCastle
                position={[26, 2, 27]}
                rotation={Math.PI / 1.5}
                scale={1.5}
            />

            {/* 🗿 MOAI - Sud con ERBA alla base e 2 TORCE davanti */}
            <Moai position={[0, 7, -25]} rotation={Math.PI} scale={2.5} />

            {/* 🌿 Erba sotto il Moai */}
            <Grass position={[0, 4, -25]} scale={3} rotation={0} />

            {/* 🔥 2 Torce davanti al Moai - simmetriche */}
            <Torch position={[-4, 4.5, -19]} scale={2} rotation={Math.PI} />
            <Torch position={[4, 4.5, -19]} scale={2} rotation={Math.PI} />

            {/* 🦀 Granchi - Sud  */}
            <Crab position={[7, 2.2, -40]} rotation={Math.PI} scale={0.0015} />
            <Crab
                position={[8, 2.3, -39]}
                rotation={Math.PI / 1.1}
                scale={0.0016}
            />
            <Crab
                position={[9, 2.2, -40]}
                rotation={Math.PI / 1.6}
                scale={0.0014}
            />

            {/* 🏠 House - Est */}
            <House position={[-55, 2, 0]} rotation={Math.PI / 2} scale={0.02} />

            {/* 🪑 Table - Est */}
            <Table
                position={[-25, 3.5, 3]}
                rotation={Math.PI / 2}
                scale={1.5}
            />

            {/* 🍖 Grill - Est */}
            <Grill
                position={[-25, 4.5, 0]}
                rotation={Math.PI / 2}
                scale={1.2}
            />

            {/* ⛱️ Ombrellone - Est */}
            <Umbrella
                position={[-25, 6.5, 5]}
                rotation={Math.PI / 2}
                scale={0.02}
            />

            {/* 🐢 Tartaruga - Est  */}
            <Turtle
                position={[-35, 2.2, 27]}
                rotation={Math.PI / 1.2}
                scale={0.01}
            />

            {/* 🚣 Boat - Est */}
            <Rowboat
                position={[-35, 1, -25]}
                rotation={Math.PI / 1.7}
                scale={0.15}
            />

            {/* 🔥 Bonfire - Ovest */}
            <Bonfire position={[26, 3, 0]} rotation={Math.PI / 2} scale={8} />

            {/* 🏄 Surfboards - Ovest */}
            <SurfboardOne
                position={[30, 5, 5]}
                rotation={Math.PI / 1.3}
                scale={0.15}
            />
            <SurfboardTwo
                position={[32, 2, -7]}
                rotation={Math.PI / 1.7}
                scale={0.02}
            />

            {/* 🏖️ Hammock - Ovest */}
            <Hammock
                position={[20, 6, 9]}
                rotation={Math.PI / -1.2}
                scale={0.015}
            />

            {/* 🦜 Parrot + Info - Centro */}
            <Parrot
                position={[6.1, 9.5, 6.1]}
                rotation={Math.PI / -1.3}
                scale={0.01}
            />
            <Info
                position={[6, 4.9, 6]}
                rotation={Math.PI / -1.3}
                scale={2.5}
            />
        </group>
    );
};
