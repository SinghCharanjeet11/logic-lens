/**
 * Favicon Generation Script
 * Generates multiple favicon sizes from the icon-only SVG
 * 
 * Usage: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Favicon sizes to generate
const sizes = [16, 32, 64, 128, 256];

// Source SVG file
const sourceSvg = path.join(publicDir, 'logo-v2-icon.svg');

// Check if source file exists
if (!fs.existsSync(sourceSvg)) {
  console.error('❌ Error: logo-v2-icon.svg not found in public/ directory');
  process.exit(1);
}

console.log('🎨 Generating favicons from logo-v2-icon.svg...\n');

// Generate PNG favicons for each size
const generatePromises = sizes.map(size => {
  const outputFile = path.join(publicDir, `favicon-${size}.png`);
  
  return sharp(sourceSvg)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(outputFile)
    .then(() => {
      console.log(`✅ Generated favicon-${size}.png`);
    })
    .catch(err => {
      console.error(`❌ Error generating favicon-${size}.png:`, err.message);
    });
});

// Generate standard favicon.ico (32x32)
const generateIco = sharp(sourceSvg)
  .resize(32, 32, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toFile(path.join(publicDir, 'favicon.ico'))
  .then(() => {
    console.log('✅ Generated favicon.ico');
  })
  .catch(err => {
    console.error('❌ Error generating favicon.ico:', err.message);
  });

// Wait for all generations to complete
Promise.all([...generatePromises, generateIco])
  .then(() => {
    console.log('\n🎉 All favicons generated successfully!');
    console.log('\nGenerated files:');
    sizes.forEach(size => console.log(`  - favicon-${size}.png`));
    console.log('  - favicon.ico');
    console.log('\n📝 Next step: Update app/layout.tsx with new favicon references');
  })
  .catch(err => {
    console.error('\n❌ Favicon generation failed:', err);
    process.exit(1);
  });
