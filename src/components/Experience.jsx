import { Environment } from '@react-three/drei';
import { CharacterController } from './CharacterController';
import { Island } from './Island';
import { SunsetLighting } from './SunsetLighting';
import { SunsetSky } from './SunsetSky';
import { DayNightDriver } from './DayNightDriver';
import { AtmosphericFog } from './AtmosphericFog';
import { BonfireFX } from './BonfireFX';
import { NightStars } from './NightStars';
import { OrbHunt } from './OrbHunt';
import { CoconutGame } from './CoconutGame';
import { SurfBoard } from './SurfBoard';
import { FishingRod } from './FishingRod';
import { FishingGame } from './FishingGame';

export const Experience = () => {
    return (
        <>
            <DayNightDriver />
            <AtmosphericFog />
            <SunsetSky />
            <NightStars />
            <SunsetLighting />
            <Environment preset="sunset" />

            <Island />
            <CharacterController />

            {/* Effetti particellari */}
            <BonfireFX position={[26, 4, 0]} />

            <OrbHunt />
            <CoconutGame />
            <SurfBoard />
            <FishingRod />
            <FishingGame />
        </>
    );
};
