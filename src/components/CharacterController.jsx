import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, vec3 } from '@react-three/rapier';
import { useRef, useState } from 'react';
import { Vector3 } from 'three';
import { Controls } from '../App';
import { useStore } from './useStore';
import { Character } from './Character';
import { playerState } from './playerState';
import { surfState } from './surfState';
import { fishingState } from './fishingState';

const MOVEMENT_SPEED = 6.5;
const JUMP_FORCE = 12;
const ROTATION_SPEED = 2.6; // rad/s

const UP = new Vector3(0, 1, 0);
const vel = new Vector3();
const camOffsetBase = new Vector3(0, 6, -12);
const camOffsetSurf = new Vector3(0, 2.2, -5); // più basso e ravvicinato dietro
const camOffsetFish = new Vector3(0, 5, -9); // un po' sopra la spalla per inquadrare il mare
const tmpOffset = new Vector3();
const tmpCamTarget = new Vector3();

export const CharacterController = ({ ...props }) => {
    const [animation, setAnimation] = useState('idle');
    const [, get] = useKeyboardControls();

    const rb = useRef();
    const charRef = useRef();
    const rotY = useRef(0); // gestita manualmente: rigidbody ha rotazioni bloccate
    const inTheAir = useRef(true);
    const landed = useRef(false);

    const cameraLookAt = useRef();

    useFrame(({ camera }, delta) => {
        if (!rb.current) return;

        // === TELEPORT REQUEST (start/end surf) ===
        if (surfState.teleportRequested && surfState.teleportTarget) {
            rb.current.setTranslation(
                {
                    x: surfState.teleportTarget[0],
                    y: surfState.teleportTarget[1],
                    z: surfState.teleportTarget[2],
                },
                true,
            );
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rotY.current = surfState.teleportRotY || 0;
            if (charRef.current) charRef.current.rotation.y = rotY.current;
            surfState.teleportRequested = false;
        }

        // === TELEPORT REQUEST (start/end fishing) ===
        if (fishingState.teleportRequested && fishingState.teleportTarget) {
            rb.current.setTranslation(
                {
                    x: fishingState.teleportTarget[0],
                    y: fishingState.teleportTarget[1],
                    z: fishingState.teleportTarget[2],
                },
                true,
            );
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rotY.current = fishingState.teleportRotY || 0;
            if (charRef.current) charRef.current.rotation.y = rotY.current;
            fishingState.teleportRequested = false;
        }

        const rbPosition = vec3(rb.current.translation());

        // === SURF MODE: input bloccato, character animato dal tilt ===
        if (surfState.active) {
            // Inchioda la posizione: gravity esiste ma riportiamo ogni frame
            const target = surfState.teleportTarget || [
                rbPosition.x,
                rbPosition.y,
                rbPosition.z,
            ];
            // Bobbing onda visivo: sopposizione su Y
            const tNow = performance.now() * 0.001;
            const bob = Math.sin(tNow * 1.6) * 0.18;
            rb.current.setTranslation(
                { x: target[0], y: target[1] + bob, z: target[2] },
                true,
            );
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

            if (charRef.current) {
                // Roll laterale del personaggio = tilt del game
                charRef.current.rotation.z = -surfState.tilt * 0.3;
                charRef.current.rotation.y = rotY.current;
                // Abbassa visivamente il personaggio per appoggiarlo sulla tavola
                charRef.current.position.y = -0.55;
            }
            if (animation !== 'idle') setAnimation('idle');

            // Camera: terza persona bassa dietro
            tmpOffset.copy(camOffsetSurf).applyAxisAngle(UP, rotY.current);
            tmpCamTarget.copy(rbPosition).add(tmpOffset);
            // Alza un po' il target di lookAt
            const lookTarget = rbPosition.clone();
            lookTarget.y += 0.6;
            camera.position.lerp(tmpCamTarget, 0.12);
            camera.lookAt(lookTarget);

            // Publish state (per HotZone distance check, anche se off-island)
            playerState.x = rbPosition.x;
            playerState.y = rbPosition.y;
            playerState.z = rbPosition.z;
            playerState.rotY = rotY.current;
            playerState.moving = false;
            playerState.onGround = true;
            return;
        }

        // === FISHING MODE: input bloccato, player fermo sulla riva ===
        if (fishingState.active) {
            const target = fishingState.teleportTarget || [
                rbPosition.x,
                rbPosition.y,
                rbPosition.z,
            ];
            // Inchioda nello spot fissato sulla sabbia (no bobbing)
            rb.current.setTranslation(
                { x: target[0], y: target[1], z: target[2] },
                true,
            );
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

            if (charRef.current) {
                charRef.current.rotation.z = 0;
                charRef.current.rotation.y = rotY.current;
                charRef.current.position.y = 0;
            }
            if (animation !== 'idle') setAnimation('idle');

            // Camera: terza persona standard ma più alta per vedere il mare
            tmpOffset.copy(camOffsetFish).applyAxisAngle(UP, rotY.current);
            tmpCamTarget.copy(rbPosition).add(tmpOffset);
            const lookTarget = rbPosition.clone();
            lookTarget.y += 0.6;
            // Anticipa lookAt verso il largo per inquadrare la zona di pesca
            lookTarget.x += Math.sin(rotY.current) * 6;
            lookTarget.z += Math.cos(rotY.current) * 6;
            camera.position.lerp(tmpCamTarget, 0.1);
            camera.lookAt(lookTarget);

            playerState.x = rbPosition.x;
            playerState.y = rbPosition.y;
            playerState.z = rbPosition.z;
            playerState.rotY = rotY.current;
            playerState.moving = false;
            playerState.onGround = true;
            return;
        }

        // === MODALITÀ NORMALE ===
        // Reset eventuale roll residuo
        if (charRef.current && charRef.current.rotation.z !== 0) {
            charRef.current.rotation.z = 0;
        }
        // Reset offset Y residuo dal surf
        if (charRef.current && charRef.current.position.y !== 0) {
            charRef.current.position.y = 0;
        }

        // 🕹️ INPUT
        const keyboardControls = get();
        const mobile = useStore.getState().mobileControls;
        const forward = keyboardControls[Controls.forward] || mobile.forward;
        const back = keyboardControls[Controls.back] || mobile.back;
        const left = keyboardControls[Controls.left] || mobile.left;
        const right = keyboardControls[Controls.right] || mobile.right;
        const jump = keyboardControls[Controls.jump] || mobile.jump;

        // 🔄 ROTAZIONE MANUALE (no torque da contatti)
        if (left) rotY.current += ROTATION_SPEED * delta;
        if (right) rotY.current -= ROTATION_SPEED * delta;
        if (charRef.current) charRef.current.rotation.y = rotY.current;

        // 🚶 MOVIMENTO ruotato per rotY
        vel.set(0, 0, 0);
        if (forward) vel.z += MOVEMENT_SPEED;
        if (back) vel.z -= MOVEMENT_SPEED;
        vel.applyAxisAngle(UP, rotY.current);

        const curVel = rb.current.linvel();

        // 🦘 JUMP
        if (jump && !inTheAir.current && landed.current) {
            vel.y = JUMP_FORCE;
            inTheAir.current = true;
            landed.current = false;
        } else {
            vel.y = curVel.y;
        }

        if (Math.abs(vel.y) > 1) {
            inTheAir.current = true;
            landed.current = false;
        } else {
            inTheAir.current = false;
        }

        rb.current.setLinvel(vel, true);

        // 🎥 CAMERA FOLLOW (offset ruotato manualmente)
        tmpOffset.copy(camOffsetBase).applyAxisAngle(UP, rotY.current);
        tmpCamTarget.copy(rbPosition).add(tmpOffset);
        camera.position.lerp(tmpCamTarget, 0.08);

        if (!cameraLookAt.current) cameraLookAt.current = rbPosition.clone();
        cameraLookAt.current.lerp(rbPosition, 0.1);
        camera.lookAt(cameraLookAt.current);

        // 🎬 ANIMATIONS
        const movement = Math.abs(vel.x) + Math.abs(vel.z);
        let nextAnimation;
        if (inTheAir.current && vel.y > 2) nextAnimation = 'jump_up';
        else if (inTheAir.current && vel.y < -5) nextAnimation = 'fall';
        else if (movement > 1 || inTheAir.current) nextAnimation = 'run';
        else nextAnimation = 'idle';

        if (nextAnimation !== animation) setAnimation(nextAnimation);

        // 📡 PUBLISH STATE per HUD/HotZone
        playerState.x = rbPosition.x;
        playerState.y = rbPosition.y;
        playerState.z = rbPosition.z;
        playerState.rotY = rotY.current;
        playerState.moving = movement > 1;
        playerState.onGround = !inTheAir.current;
    });

    return (
        <RigidBody
            {...props}
            ref={rb}
            position={[0, 12, 0]}
            colliders={false}
            canSleep={false}
            // TUTTE le rotazioni bloccate: niente torque/auto-rotazione da contatti
            enabledRotations={[false, false, false]}
            gravityScale={2.5}
            name="player"
            friction={0}
            onCollisionEnter={(e) => {
                const name = e.other.rigidBodyObject?.name;
                if (
                    name === 'floor' ||
                    name === 'elevated-floor' ||
                    name === 'coastal-terrain' ||
                    name === 'stone-path'
                ) {
                    inTheAir.current = false;
                    landed.current = true;
                    const cv = rb.current.linvel();
                    cv.y = 0;
                    rb.current.setLinvel(cv);
                }
            }}
        >
            <group ref={charRef}>
                <Character
                    scale={0.42}
                    color="#4a90e2"
                    name="Visitatore"
                    position-y={0.2}
                    animation={animation}
                />
            </group>
            <CapsuleCollider args={[0.1, 0.38]} position={[0, 0.68, 0]} />
        </RigidBody>
    );
};
