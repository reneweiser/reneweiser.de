/**
 * Generates square avatar crops from the profile photo.
 *
 * Usage: bun run scripts/optimize-profile-image.ts
 *
 * Outputs:
 *   static/profile-avatar.webp     — 96x96 square, face-centered
 *   static/profile-avatar@2x.webp  — 192x192 square, face-centered
 */

import sharp from "sharp";
import { statSync } from "node:fs";

const SOURCE = "static/profile.webp";

// Face is right-of-center in the source image (2000x1333).
// Extract a square region centered on the face.
const FACE_CENTER_X = 1200;
const FACE_CENTER_Y = 500;
const CROP_SIZE = 800; // source pixels for the square crop

const left = Math.round(FACE_CENTER_X - CROP_SIZE / 2);
const top = Math.round(FACE_CENTER_Y - CROP_SIZE / 2);

const variants = [
  { size: 96, output: "static/profile-avatar.webp" },
  { size: 192, output: "static/profile-avatar@2x.webp" },
];

console.log("Generating profile avatars...\n");

for (const { size, output } of variants) {
  await sharp(SOURCE)
    .extract({ left, top, width: CROP_SIZE, height: CROP_SIZE })
    .resize(size, size)
    .webp({ quality: 80 })
    .toFile(output);

  const sizeKB = (statSync(output).size / 1024).toFixed(1);
  console.log(`  ✓ ${output} (${size}x${size}, ${sizeKB} KB)`);
}

console.log("\nDone!");
