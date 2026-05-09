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
import { HotZone } from './HotZone';
import { palmTrees, crabs, torches } from './islandLayout';
import { StonePath } from './StonePath';

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

            {/* 🪨 Sentiero di pietre poligonali al centro + 4 strade radiali */}
            <StonePath />

            {/* 🌊 OCEANO con Perlin Noise Pattern */}
            <CoastalWater position={[0, 0.9, 0]} size={800} />

            {/* 🌴 PALME (15) - Layout in islandLayout.js */}
            {palmTrees.map((p, i) => (
                <PalmTree key={`palm-${i}`} {...p} />
            ))}

            {/* 🚧 BARRIERA OCEANO - Muro invisibile nel mare */}
            <OceanBarrier radius={65} height={5} />

            {/* 🎬 CINEMA SCREEN - Nord (guarda verso centro/sud) */}
            <WoodenCinemaScreen
                position={[0, 3, 25]}
                rotation={[0, Math.PI, 0]}
                imageUrl="video/video_small.mp4"
            />

            {/* Hot zone cliccabile davanti al cinema */}
            <HotZone
                position={[0, 5, 22]}
                args={[10, 6, 4]}
                modal="cinema"
                label="Guarda il video"
                markerOffset={[0, 5, 0]}
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
            <HotZone
                position={[0, 9, -22]}
                modal="moai"
                label="Parla col Moai"
                markerOffset={[0, 2, 0]}
            />

            {/* 🌿 Erba sotto il Moai */}
            <Grass position={[0, 4, -25]} scale={3} rotation={0} />

            {/* 🔥 Torce davanti al Moai */}
            {torches.map((t, i) => (
                <Torch key={`torch-${i}`} {...t} />
            ))}

            {/* 🦀 Granchi - Sud  */}
            {crabs.map((c, i) => (
                <Crab key={`crab-${i}`} {...c} />
            ))}

            {/* 🏠 House - Est */}
            <House position={[-55, 2, 0]} rotation={Math.PI / 2} scale={0.02} />
            <HotZone
                position={[-42, 7, 0]}
                modal="house"
                label="Cabina"
                revealDistance={12}
                markerOffset={[0, 1.5, 0]}
            />

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

            {/* 🐢 Tartaruga sulla sabbia */}
            <Turtle
                position={[-35, 1.7, 27]}
                rotation={Math.PI / 1.2}
                scale={0.01}
            />
            <HotZone
                position={[-35, 3.5, 27]}
                modal="turtle"
                label="Parla con la Tartaruga"
                markerOffset={[0, 1, 0]}
            />

            {/* 🚣 Boat - Est */}
            <Rowboat
                position={[-35, 1, -25]}
                rotation={Math.PI / 1.7}
                scale={0.15}
            />
            <HotZone
                position={[-35, 3, -25]}
                modal="fishing"
                label="🎣 Pesca dalla barca"
                markerOffset={[0, 1.5, 0]}
            />

            {/* 🔥 Bonfire - Ovest */}
            <Bonfire position={[26, 3, 0]} rotation={Math.PI / 2} scale={8} />
            <HotZone
                position={[26, 6, 0]}
                modal="bonfire"
                label="Falò"
                markerOffset={[0, 1.5, 0]}
            />

            {/* Acqua - hot zone in shore */}
            <HotZone
                position={[40, 3, 30]}
                modal="water"
                label="Oceano"
                markerOffset={[0, 2, 0]}
            />

            {/* 🏄 Surfboards - Ovest */}
            <SurfboardOne
                position={[30, 5, 5]}
                rotation={Math.PI / 1.3}
                scale={0.15}
            />
            <HotZone
                position={[30, 5, 5]}
                modal="surf"
                label="Surf Challenge"
                markerOffset={[0, 1.5, 0]}
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

            {/* 🦜 Parrot appoggiato sulla lavagna Info */}
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

            {/* Hot zone cliccabile sull'info board */}
            <HotZone
                position={[6, 5.5, 6]}
                args={[3, 3, 3]}
                modal="info"
                label="Informazioni"
                markerOffset={[0, 2.5, 0]}
            />
        </group>
    );
};
