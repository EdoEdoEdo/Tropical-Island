#!/usr/bin/env node
/**
 * Comprime tutti i .glb in public/models/ usando @gltf-transform/cli.
 * Uso: npm run optimize:models
 *
 * Pipeline applicata:
 *  - dedup           (rimuove geometrie/materiali duplicati)
 *  - prune           (rimuove nodi/mesh non usati)
 *  - resample        (riduce keyframes animazioni)
 *  - meshopt         (compressione geometrie + quantizzazione)
 *  - texture compress webp
 *
 * Backup automatico in public/models/_backup/ prima di sovrascrivere.
 */
import { execSync } from 'node:child_process';
import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    statSync,
} from 'node:fs';
import { join } from 'node:path';

const MODELS_DIR = 'public/models';
const BACKUP_DIR = join(MODELS_DIR, '_backup');

const files = readdirSync(MODELS_DIR).filter((f) => f.endsWith('.glb'));
if (files.length === 0) {
    console.log('Nessun .glb trovato in', MODELS_DIR);
    process.exit(0);
}

if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

let totalBefore = 0;
let totalAfter = 0;
let okCount = 0;
let errCount = 0;

for (const file of files) {
    const path = join(MODELS_DIR, file);
    const backupPath = join(BACKUP_DIR, file);

    // Backup (idempotente: se esiste, non sovrascrivere)
    if (!existsSync(backupPath)) {
        copyFileSync(path, backupPath);
    }

    const before = statSync(path).size;
    totalBefore += before;

    process.stdout.write(
        `▸ ${file.padEnd(28)} ${(before / 1024).toFixed(1).padStart(7)} KB → `,
    );

    try {
        execSync(
            `npx --yes gltf-transform optimize "${backupPath}" "${path}" --compress meshopt --texture-compress webp`,
            { stdio: ['ignore', 'ignore', 'pipe'] },
        );
        const after = statSync(path).size;
        totalAfter += after;
        const pct = (((before - after) / before) * 100).toFixed(0);
        console.log(`${(after / 1024).toFixed(1).padStart(7)} KB  (-${pct}%)`);
        okCount++;
    } catch (err) {
        totalAfter += before;
        console.log(`ERRORE: ${err.message.split('\n')[0]}`);
        errCount++;
    }
}

const totalPct = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0);
console.log(
    `\n✅ ${okCount}/${files.length} ottimizzati. Totale: ${(totalBefore / 1024).toFixed(0)} KB → ${(totalAfter / 1024).toFixed(0)} KB (-${totalPct}%)`,
);
if (errCount > 0) {
    console.log(
        `⚠️  ${errCount} file falliti. Backup originali in ${BACKUP_DIR}/`,
    );
}
console.log(`\n💾 Backup originali salvati in ${BACKUP_DIR}/`);
console.log(
    '   Per ripristinare: cp public/models/_backup/*.glb public/models/',
);
