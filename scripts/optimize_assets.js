const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function optimizeImages() {
  const sealsDir = path.join(__dirname, '../public/assets/seals');
  const certsDir = path.join(__dirname, '../public/assets/certificates');

  console.log('⚡ Optimizing seal images...');
  const tSealBuf = await sharp(fs.readFileSync(path.join(sealsDir, 'tribunal_seal.png')))
    .resize(256, 256)
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(sealsDir, 'tribunal_seal.png'), tSealBuf);

  const cSealBuf = await sharp(fs.readFileSync(path.join(sealsDir, 'celestial_seal.png')))
    .resize(256, 256)
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(sealsDir, 'celestial_seal.png'), cSealBuf);

  console.log('⚡ Optimizing parchment backgrounds...');
  const dParchBuf = await sharp(fs.readFileSync(path.join(certsDir, 'dark_parchment.jpg')))
    .resize(800)
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
  fs.writeFileSync(path.join(certsDir, 'dark_parchment.jpg'), dParchBuf);

  const cParchBuf = await sharp(fs.readFileSync(path.join(certsDir, 'celestial_parchment.jpg')))
    .resize(800)
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
  fs.writeFileSync(path.join(certsDir, 'celestial_parchment.jpg'), cParchBuf);

  // Clean up any _opt temp files if created
  ['dark_parchment_opt.jpg', 'celestial_parchment_opt.jpg'].forEach((f) => {
    const p = path.join(certsDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });

  console.log('✅ All assets compressed to ultra-fast sizes (instant loading)!');
}

optimizeImages();
