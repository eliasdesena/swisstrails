/**
 * Generates all PWA/favicon assets from the LogoIcon SVG.
 * Run: node apps/web/scripts/generate-icons.mjs
 * Requires: sharp (already in deps)
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "../public");

mkdirSync(PUBLIC, { recursive: true });

// The LogoIcon path — centered in a square canvas with padding
function makeSvg(size, bgColor = "#06080F", iconColor = "#6B78FF") {
  const pad = size * 0.15;
  const inner = size - pad * 2;
  // viewBox of the logo is 325x445 — center it in a square
  const aspect = 325 / 445;
  const w = inner * aspect;
  const h = inner;
  const x = (size - w) / 2;
  const y = (size - h) / 2;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.2}"/>
  <svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 325 445" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd">
    <g transform="translate(-972.706964,-1277.679452)">
      <g transform="matrix(0.907575,0,0,0.907575,670.18004,1051.449676)">
        <path d="M372.688,732.468C366.113,739.035 356.23,740.996 347.645,737.439C339.06,733.882 333.461,725.505 333.457,716.212C333.421,609.584 333.362,397.607 333.335,300.28C333.331,286.753 338.702,273.778 348.266,264.21C357.83,254.643 370.804,249.268 384.332,249.268L640.096,249.268C668.242,249.268 691.066,272.072 691.092,300.218C691.079,398.689 691.071,614.26 691.232,714.705C691.347,723.869 686.008,732.227 677.643,735.974C669.278,739.72 659.487,738.139 652.726,731.951C620.71,702.766 578.094,664.113 561.881,650.075C558.229,646.913 555.822,646.521 558.909,642.832C584.997,611.656 637.991,573.668 583.598,530.365C543.258,498.251 448.81,498.211 518.773,452.926C528.638,446.54 559.531,440.806 566.637,405.526C576.951,354.328 511.033,314.735 469.783,359.745C444.13,387.736 457.757,439.927 499.389,448.728C506.102,450.147 485.228,454.728 463.196,470.082C410.922,506.512 514.473,518.38 516.061,574.502C516.864,602.909 484.056,623.17 419.502,685.502C415.057,689.794 396.047,708.973 372.688,732.468Z" fill="${iconColor}"/>
      </g>
    </g>
  </svg>
</svg>`;
}

// Flat version (no rounded corners) for favicon
function makeFlatSvg(size, bgColor = "#06080F", iconColor = "#6B78FF") {
  const pad = size * 0.1;
  const inner = size - pad * 2;
  const aspect = 325 / 445;
  const w = inner * aspect;
  const h = inner;
  const x = (size - w) / 2;
  const y = (size - h) / 2;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}"/>
  <svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 325 445" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd">
    <g transform="translate(-972.706964,-1277.679452)">
      <g transform="matrix(0.907575,0,0,0.907575,670.18004,1051.449676)">
        <path d="M372.688,732.468C366.113,739.035 356.23,740.996 347.645,737.439C339.06,733.882 333.461,725.505 333.457,716.212C333.421,609.584 333.362,397.607 333.335,300.28C333.331,286.753 338.702,273.778 348.266,264.21C357.83,254.643 370.804,249.268 384.332,249.268L640.096,249.268C668.242,249.268 691.066,272.072 691.092,300.218C691.079,398.689 691.071,614.26 691.232,714.705C691.347,723.869 686.008,732.227 677.643,735.974C669.278,739.72 659.487,738.139 652.726,731.951C620.71,702.766 578.094,664.113 561.881,650.075C558.229,646.913 555.822,646.521 558.909,642.832C584.997,611.656 637.991,573.668 583.598,530.365C543.258,498.251 448.81,498.211 518.773,452.926C528.638,446.54 559.531,440.806 566.637,405.526C576.951,354.328 511.033,314.735 469.783,359.745C444.13,387.736 457.757,439.927 499.389,448.728C506.102,450.147 485.228,454.728 463.196,470.082C410.922,506.512 514.473,518.38 516.061,574.502C516.864,602.909 484.056,623.17 419.502,685.502C415.057,689.794 396.047,708.973 372.688,732.468Z" fill="${iconColor}"/>
      </g>
    </g>
  </svg>
</svg>`;
}

async function generate() {
  console.log("Generating icons...");

  // favicon-16x16.png
  await sharp(Buffer.from(makeFlatSvg(16))).png().toFile(join(PUBLIC, "favicon-16x16.png"));
  console.log("✓ favicon-16x16.png");

  // favicon-32x32.png
  await sharp(Buffer.from(makeFlatSvg(32))).png().toFile(join(PUBLIC, "favicon-32x32.png"));
  console.log("✓ favicon-32x32.png");

  // favicon.ico (use 32x32 png renamed — browsers accept this)
  await sharp(Buffer.from(makeFlatSvg(32))).png().toFile(join(PUBLIC, "favicon.ico"));
  console.log("✓ favicon.ico");

  // apple-touch-icon.png (180x180, rounded in SVG)
  await sharp(Buffer.from(makeSvg(180))).png().toFile(join(PUBLIC, "apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");

  // icon-192x192.png (PWA)
  await sharp(Buffer.from(makeSvg(192))).png().toFile(join(PUBLIC, "icon-192x192.png"));
  console.log("✓ icon-192x192.png");

  // icon-512x512.png (PWA splash)
  await sharp(Buffer.from(makeSvg(512))).png().toFile(join(PUBLIC, "icon-512x512.png"));
  console.log("✓ icon-512x512.png");

  // icon-maskable-512x512.png (full bleed for adaptive icons)
  const maskable = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#06080F"/>
  <svg x="83" y="40" width="346" height="432" viewBox="0 0 325 445" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd">
    <g transform="translate(-972.706964,-1277.679452)">
      <g transform="matrix(0.907575,0,0,0.907575,670.18004,1051.449676)">
        <path d="M372.688,732.468C366.113,739.035 356.23,740.996 347.645,737.439C339.06,733.882 333.461,725.505 333.457,716.212C333.421,609.584 333.362,397.607 333.335,300.28C333.331,286.753 338.702,273.778 348.266,264.21C357.83,254.643 370.804,249.268 384.332,249.268L640.096,249.268C668.242,249.268 691.066,272.072 691.092,300.218C691.079,398.689 691.071,614.26 691.232,714.705C691.347,723.869 686.008,732.227 677.643,735.974C669.278,739.72 659.487,738.139 652.726,731.951C620.71,702.766 578.094,664.113 561.881,650.075C558.229,646.913 555.822,646.521 558.909,642.832C584.997,611.656 637.991,573.668 583.598,530.365C543.258,498.251 448.81,498.211 518.773,452.926C528.638,446.54 559.531,440.806 566.637,405.526C576.951,354.328 511.033,314.735 469.783,359.745C444.13,387.736 457.757,439.927 499.389,448.728C506.102,450.147 485.228,454.728 463.196,470.082C410.922,506.512 514.473,518.38 516.061,574.502C516.864,602.909 484.056,623.17 419.502,685.502C415.057,689.794 396.047,708.973 372.688,732.468Z" fill="#6B78FF"/>
      </g>
    </g>
  </svg>
</svg>`;
  await sharp(Buffer.from(maskable)).png().toFile(join(PUBLIC, "icon-maskable-512x512.png"));
  console.log("✓ icon-maskable-512x512.png");

  // og-image.jpg (1200x630)
  const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="60%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1a1f3a"/>
      <stop offset="100%" stop-color="#06080F"/>
    </radialGradient>
    <radialGradient id="g2" cx="30%" cy="60%" r="50%">
      <stop offset="0%" stop-color="#0d1033" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#06080F" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <!-- Alpine glow -->
  <ellipse cx="750" cy="315" rx="400" ry="280" fill="#515EFF" opacity="0.07"/>
  <!-- Logo icon -->
  <svg x="80" y="175" width="178" height="244" viewBox="0 0 325 445" style="fill-rule:evenodd;clip-rule:evenodd">
    <g transform="translate(-972.706964,-1277.679452)">
      <g transform="matrix(0.907575,0,0,0.907575,670.18004,1051.449676)">
        <path d="M372.688,732.468C366.113,739.035 356.23,740.996 347.645,737.439C339.06,733.882 333.461,725.505 333.457,716.212C333.421,609.584 333.362,397.607 333.335,300.28C333.331,286.753 338.702,273.778 348.266,264.21C357.83,254.643 370.804,249.268 384.332,249.268L640.096,249.268C668.242,249.268 691.066,272.072 691.092,300.218C691.079,398.689 691.071,614.26 691.232,714.705C691.347,723.869 686.008,732.227 677.643,735.974C669.278,739.72 659.487,738.139 652.726,731.951C620.71,702.766 578.094,664.113 561.881,650.075C558.229,646.913 555.822,646.521 558.909,642.832C584.997,611.656 637.991,573.668 583.598,530.365C543.258,498.251 448.81,498.211 518.773,452.926C528.638,446.54 559.531,440.806 566.637,405.526C576.951,354.328 511.033,314.735 469.783,359.745C444.13,387.736 457.757,439.927 499.389,448.728C506.102,450.147 485.228,454.728 463.196,470.082C410.922,506.512 514.473,518.38 516.061,574.502C516.864,602.909 484.056,623.17 419.502,685.502C415.057,689.794 396.047,708.973 372.688,732.468Z" fill="#6B78FF"/>
      </g>
    </g>
  </svg>
  <!-- Text -->
  <text x="290" y="278" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#FFFFFF" letter-spacing="-1">Swiss Trails</text>
  <text x="290" y="336" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="400" fill="#8892B0">500+ hidden gems across Switzerland</text>
  <text x="290" y="396" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#515EFF">One payment · Lifetime access</text>
</svg>`;

  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 95 }).toFile(join(PUBLIC, "og-image.jpg"));
  console.log("✓ og-image.jpg");

  console.log("\nAll icons generated successfully.");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
