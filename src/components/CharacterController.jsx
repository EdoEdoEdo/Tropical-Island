import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
    CapsuleCollider,
    RigidBody,
    euler,
    quat,
    vec3,
} from '@react-three/rapier';
import { useRef, useState } from 'react';
import { Vector3 } from 'three';
import { Controls, mobileControls } from '../App';
import { Character } from './Character';

const MOVEMENT_SPEED = 6.5;
const JUMP_FORCE = 12;
const ROTATION_SPEED = 3.0;

const vel = new Vector3();

export const CharacterController = ({ ...props }) => {
    const [animation, setAnimation] = useState('idle');
    const [, get] = useKeyboardControls();

    const rb = useRef();
    const inTheAir = useRef(true);
    const landed = useRef(false);

    const cameraPosition = useRef();
    const cameraLookAt = useRef();

    // ✅ NORMALE DEL MURO - Per scivolamento tangenziale
    const wallNormal = useRef(null);

    useFrame(({ camera }) => {
        if (!rb.current) return;

        // ===============================
        // 🎥 CAMERA FOLLOW
        // ===============================
        const rbPosition = vec3(rb.current.translation());

        if (!cameraLookAt.current) {
            cameraLookAt.current = rbPosition.clone();
        }

        cameraLookAt.current.lerp(rbPosition, 0.05);
        camera.lookAt(cameraLookAt.current);

        cameraPosition.current.getWorldPosition(rbPosition);
        camera.position.lerp(rbPosition, 0.05);

        // ===============================
        // 🕹️ MOVEMENT INPUT
        // ===============================
        const rotVel = { x: 0, y: 0, z: 0 };
        const curVel = rb.current.linvel();

        vel.set(0, 0, 0);

        const keyboardControls = get();
        const forward =
            keyboardControls[Controls.forward] || mobileControls.forward;
        const back = keyboardControls[Controls.back] || mobileControls.back;
        const left = keyboardControls[Controls.left] || mobileControls.left;
        const right = keyboardControls[Controls.right] || mobileControls.right;
        const jump = keyboardControls[Controls.jump] || mobileControls.jump;

        if (forward) vel.z += MOVEMENT_SPEED;
        if (back) vel.z -= MOVEMENT_SPEED;
        if (left) rotVel.y += ROTATION_SPEED;
        if (right) rotVel.y -= ROTATION_SPEED;

        rb.current.setAngvel(rotVel);

        // ===============================
        // 🔄 ROTATION → WORLD SPACE
        // ===============================
        const eulerRot = euler().setFromQuaternion(quat(rb.current.rotation()));
        vel.applyEuler(eulerRot);

        // ===============================
        // 🦘 JUMP
        // ===============================
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

        // ===============================
        // 🧱 TANGENT PROJECTION - Scivola lungo il muro!
        // ===============================
        if (wallNormal.current) {
            // Normale del muro (solo X e Z, ignora Y)
            const n = new Vector3(
                wallNormal.current.x,
                0,
                wallNormal.current.z,
            ).normalize();

            // Quanto del movimento va verso il muro
            const dot = vel.dot(n);

            if (dot < 0) {
                // Rimuove la componente radiale (verso il muro)
                // Mantiene solo la componente tangenziale (parallela al muro)
                vel.sub(n.multiplyScalar(dot));
            }
        }

        // ===============================
        // 🚀 APPLY VELOCITY
        // ===============================
        rb.current.setLinvel(vel, true);

        // ===============================
        // 🎬 ANIMATIONS
        // ===============================
        const movement = Math.abs(vel.x) + Math.abs(vel.z);

        if (inTheAir.current && vel.y > 2) {
            setAnimation('jump_up');
        } else if (inTheAir.current && vel.y < -5) {
            setAnimation('fall');
        } else if (movement > 1 || inTheAir.current) {
            setAnimation('run');
        } else {
            setAnimation('idle');
        }
    });

    return (
        <RigidBody
            {...props}
            ref={rb}
            position={[0, 12, 0]} // ← ALZATO a 12m (isola ora più alta)
            colliders={false}
            canSleep={false}
            enabledRotations={[false, true, false]}
            gravityScale={2.5}
            name="player"
            friction={0} // Zero attrito per movimento fluido
            // ===============================
            // 💥 COLLISIONS
            // ===============================
            onCollisionEnter={(e) => {
                const name = e.other.rigidBodyObject?.name;

                // Quando tocca il muro, salva la normale
                if (name === 'wall') {
                    const n = e.manifold?.normal();
                    if (n) wallNormal.current = n;
                }

                // Quando atterra sul pavimento
                if (
                    name === 'floor' ||
                    name === 'elevated-floor' ||
                    name === 'coastal-terrain'
                ) {
                    inTheAir.current = false;
                    landed.current = true;

                    const curVel = rb.current.linvel();
                    curVel.y = 0;
                    rb.current.setLinvel(curVel);
                }
            }}
            onCollisionExit={(e) => {
                // Quando si stacca dal muro, pulisce la normale
                if (e.other.rigidBodyObject?.name === 'wall') {
                    wallNormal.current = null;
                }
            }}
        >
            <group ref={cameraPosition} position={[0, 6, -12]} />

            <Character
                scale={0.42}
                color="#4a90e2"
                name="Visitatore"
                position-y={0.2}
                animation={animation}
            />

            <CapsuleCollider args={[0.1, 0.38]} position={[0, 0.68, 0]} />
        </RigidBody>
    );
};
