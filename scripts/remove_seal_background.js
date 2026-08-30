const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cutCircularTransparentSeal(inputPath, outputPath, options = {}) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const width = metadata.width;
    const height = metadata.height;

    const size = Math.min(width, height);
    const radius = Math.floor(size / 2) - (options.padding || 12);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // SVG mask with smooth anti-aliased alpha edge
    const maskSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <defs>
          <radialGradient id="edgeFade" cx="50%" cy="50%" r="50%">
            <stop offset="92%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="98%" stop-color="#ffffff" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#edgeFade)" />
      </svg>
    `);

    await sharp(inputPath)
      .composite([{
        input: maskSvg,
        blend: 'dest-in'
      }])
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`✅ Converted to transparent PNG: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Error processing ${inputPath}:`, err);
  }
}

async function main() {
  const sealsDir = path.join(__dirname, '../public/assets/seals');
  
  await cutCircularTransparentSeal(
    path.join(sealsDir, 'tribunal_seal.jpg'),
    path.join(sealsDir, 'tribunal_seal.png'),
    { padding: 25 }
  );

  await cutCircularTransparentSeal(
    path.join(sealsDir, 'celestial_seal.jpg'),
    path.join(sealsDir, 'celestial_seal.png'),
    { padding: 15 }
  );
}

main();
