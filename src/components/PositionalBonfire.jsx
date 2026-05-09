import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from './useStore';
import { playerState } from './playerState';

/**
 * Crepitio del falò sintetizzato via WebAudio:
 *  - Brown-noise loop (whoosh fiamma) filtrato lowpass + leggera modulazione
 *  - Pop random ogni 200-700ms (legna che scoppietta) con pitch random
 *  - Volume = funzione della distanza player↔falò (rolloff inverso, ref 4m)
 * Nessun file audio richiesto.
 */
export function PositionalBonfire({ position = [26, 4, 0], maxDistance = 25 }) {
    const audioEnabled = useStore((s) => s.audioEnabled);
    const ctxRef = useRef(null);
    const masterRef = useRef(null);
    const noiseSrcRef = useRef(null);
    const popTimeoutRef = useRef(null);

    // Setup / teardown grafo audio
    useEffect(() => {
        if (!audioEnabled) {
            // Stop everything
            if (popTimeoutRef.current) {
                clearTimeout(popTimeoutRef.current);
                popTimeoutRef.current = null;
            }
            if (noiseSrcRef.current) {
                try {
                    noiseSrcRef.current.stop();
                } catch {}
                noiseSrcRef.current = null;
            }
            if (ctxRef.current && ctxRef.current.state !== 'closed') {
                ctxRef.current.suspend();
            }
            return;
        }

        // Init lazy
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!ctxRef.current) ctxRef.current = new Ctx();
        const ctx = ctxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // === Brown noise buffer (loop) ===
        const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = buf.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < data.length; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;

        // Lowpass per fiamma morbida + leggera oscillazione
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 700;
        lp.Q.value = 0.6;

        // LFO sulla cutoff per "respiro" del fuoco
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 150;
        lfo.connect(lfoGain).connect(lp.frequency);
        lfo.start();

        const master = ctx.createGain();
        master.gain.value = 0; // partiamo silenziosi, useFrame regola con distanza

        src.connect(lp).connect(master).connect(ctx.destination);
        src.start();

        noiseSrcRef.current = src;
        masterRef.current = master;

        // === Pop random (scoppiettio) ===
        const schedulePop = () => {
            if (!ctxRef.current || !masterRef.current) return;
            const t = ctxRef.current.currentTime;
            const popOsc = ctxRef.current.createOscillator();
            const popGain = ctxRef.current.createGain();
            popOsc.type = 'triangle';
            const freq = 200 + Math.random() * 600;
            popOsc.frequency.setValueAtTime(freq, t);
            popOsc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.08);
            popGain.gain.setValueAtTime(0.0001, t);
            popGain.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
            popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
            popOsc.connect(popGain).connect(masterRef.current);
            popOsc.start(t);
            popOsc.stop(t + 0.12);
            popTimeoutRef.current = setTimeout(
                schedulePop,
                200 + Math.random() * 500,
            );
        };
        schedulePop();

        return () => {
            if (popTimeoutRef.current) clearTimeout(popTimeoutRef.current);
            try {
                src.stop();
            } catch {}
            try {
                lfo.stop();
            } catch {}
            noiseSrcRef.current = null;
            masterRef.current = null;
        };
    }, [audioEnabled]);

    // Volume in base alla distanza player↔fuoco (no PannerNode: troppo costoso e
    // non sempre orientato col camera up. Manteniamo mono con fade per distanza).
    useFrame(() => {
        if (!masterRef.current) return;
        const dx = playerState.x - position[0];
        const dy = playerState.y - position[1];
        const dz = playerState.z - position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // Rolloff inverso: vol = ref / (ref + dist - ref) clampato
        const ref = 4;
        let vol = ref / Math.max(ref, dist);
        if (dist > maxDistance) vol = 0;
        // Smooth-ish con linear ramp
        const ctx = ctxRef.current;
        if (ctx) {
            masterRef.current.gain.linearRampToValueAtTime(
                vol * 0.55,
                ctx.currentTime + 0.1,
            );
        }
    });

    return null;
}
