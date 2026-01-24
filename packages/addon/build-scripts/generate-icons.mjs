import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const svgPath = join(assetsDir, 'icon.svg');
const svgBuffer = readFileSync(svgPath);

// Generate a 512px PNG that Plasmo will use to auto-generate all sizes
const sizes = [512];

async function generateIcons() {
  console.log('Generating PNG icons from SVG...');

  for (const size of sizes) {
    const outputPath = join(assetsDir, 'icon.png');

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon.png (${size}x${size})`);
  }

  console.log('Done! Plasmo will auto-generate smaller sizes during build.');
}

generateIcons().catch(console.error);
