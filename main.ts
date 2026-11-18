// news-image-20261117 — make.fun bounty entry.
// Copies the pre-rendered poster (entry.png, 1024x1024, "The World in One Day —
// Tuesday, 17 November 2026") to /output/entry.png. Node stdlib only, no network,
// fully deterministic: the same input bytes are written on every run.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const dest = join(outDir, "entry.png");

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dest);

// The competition requires at most 1024x1024: verify the PNG dimensions
// from the IHDR chunk (width/height, big-endian, bytes 16-23) and fail
// loudly if the poster is not exactly 1024x1024.
const header = readFileSync(src);
const width = header.readUInt32BE(16);
const height = header.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}

// Verify the copy is byte-identical to the source image.
const srcHash = createHash("sha256").update(readFileSync(src)).digest("hex");
const destHash = createHash("sha256").update(readFileSync(dest)).digest("hex");
if (srcHash !== destHash) {
  throw new Error(`entry.png copy mismatch: ${srcHash} != ${destHash}`);
}
const { size } = statSync(dest);
console.log(`Wrote ${dest} (${size} bytes, sha256 ${destHash})`);
