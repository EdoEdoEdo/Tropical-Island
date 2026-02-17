import { Environment } from '@react-three/drei';
import { CharacterController } from './CharacterController';
import { Island } from './Island';
import { SunsetLighting } from './SunsetLighting';
import { SunsetSky } from './SunsetSky';

export const Experience = () => {
    return (
        <>
            {/* CIELO TRAMONTO ROSSO */}
            <SunsetSky />

            {/* ILLUMINAZIONE TRAMONTO con Ombre */}
            <SunsetLighting />

            {/* ✨ Environment per riflessioni - preset sunset */}
            <Environment preset="sunset" />

            {/* Isola */}
            <Island />

            {/* Personaggio controllabile */}
            <CharacterController />
        </>
    );
};
