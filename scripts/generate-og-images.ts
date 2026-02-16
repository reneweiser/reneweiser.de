/**
 * Generates Open Graph images for social sharing.
 *
 * Usage: bun run scripts/generate-og-images.ts
 *
 * Outputs:
 *   static/og-default.png   — Default branded card (1200×630)
 *   static/og-blog-*.png    — Per-post cards with title
 */

import sharp from "sharp";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors (from layout.css)
const INK = "#0a0908";
const PAPER = "#faf8f5";
const COPPER = "#c17f59";
const INK_SOFT = "#6b6560";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(
  text: string,
  maxCharsPerLine: number,
): { lines: string[]; fontSize: number } {
  let fontSize = 52;

  // Scale down font for long titles
  if (text.length > 60) fontSize = 44;
  if (text.length > 80) fontSize = 38;

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length + word.length + 1 > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
    } else {
      current += " " + word;
    }
  }
  if (current.trim()) lines.push(current.trim());

  // Max 3 lines
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].replace(/\s+\S*$/, "") + "…";
  }

  return { lines, fontSize };
}

function buildSvg(options: {
  title: string;
  subtitle?: string;
  footer: string;
}): string {
  const { title, subtitle, footer } = options;
  const { lines, fontSize } = wrapText(title, 30);

  const lineHeight = fontSize * 1.3;
  const textBlockHeight = lines.length * lineHeight;
  const startY = (HEIGHT - textBlockHeight) / 2 + fontSize * 0.35;

  const titleLines = lines
    .map(
      (line, i) =>
        `<text x="600" y="${startY + i * lineHeight}" text-anchor="middle" fill="${PAPER}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="600">${escapeXml(line)}</text>`,
    )
    .join("\n    ");

  const subtitleY = startY + lines.length * lineHeight + 20;
  const subtitleEl = subtitle
    ? `<text x="600" y="${subtitleY}" text-anchor="middle" fill="${COPPER}" font-family="'Segoe UI', system-ui, sans-serif" font-size="24">${escapeXml(subtitle)}</text>`
    : "";

  const footerY = subtitle ? subtitleY + 50 : startY + lines.length * lineHeight + 40;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${INK}"/>
  <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" rx="4" fill="none" stroke="${COPPER}" stroke-width="1.5" opacity="0.4"/>
  <line x1="40" y1="100" x2="${WIDTH - 40}" y2="100" stroke="${COPPER}" stroke-width="1" opacity="0.2"/>
  <line x1="40" y1="${HEIGHT - 100}" x2="${WIDTH - 40}" y2="${HEIGHT - 100}" stroke="${COPPER}" stroke-width="1" opacity="0.2"/>
    ${titleLines}
    ${subtitleEl}
    <text x="600" y="${footerY}" text-anchor="middle" fill="${INK_SOFT}" font-family="'Courier New', monospace" font-size="16">${escapeXml(footer)}</text>
</svg>`;
}

async function generateImage(svg: string, outputPath: string): Promise<void> {
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`  ✓ ${outputPath}`);
}

// --- Generate default OG image ---
console.log("Generating OG images...\n");

const defaultSvg = buildSvg({
  title: "René Weiser",
  subtitle: "Full-Stack Web Developer",
  footer: "reneweiser.de",
});
await generateImage(defaultSvg, "static/og-default.png");

// --- Generate per-post OG images ---
const blogDir = join(import.meta.dir, "..", "src", "content", "blog");
const mdFiles = readdirSync(blogDir).filter((f) => f.endsWith(".md"));

for (const file of mdFiles) {
  const content = readFileSync(join(blogDir, file), "utf-8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) continue;

  const fm = frontmatterMatch[1];
  const titleMatch = fm.match(/^title:\s*(.+)$/m);
  const publishedMatch = fm.match(/^published:\s*(.+)$/m);

  if (!titleMatch || publishedMatch?.[1].trim() !== "true") continue;

  const title = titleMatch[1].trim();
  const slug = file.replace(/\.md$/, "");

  const postSvg = buildSvg({
    title,
    footer: "reneweiser.de/blog",
  });
  await generateImage(postSvg, `static/og-blog-${slug}.png`);
}

console.log("\nDone!");
