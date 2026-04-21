const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAssets() {
  // Create assets directory if it doesn't exist
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Icon 1024x1024
  const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#0D0D1A"/>
  <text x="512" y="580" font-family="Arial" font-size="400" font-weight="bold" fill="#00D4AA" text-anchor="middle">PE</text>
</svg>`;

  await sharp(Buffer.from(iconSvg))
    .png().toFile(path.join(assetsDir, 'icon.png'));
  
  await sharp(Buffer.from(iconSvg))
    .png().toFile(path.join(assetsDir, 'adaptive-icon.png'));

  // Splash 1284x2778
  const splashSvg = `
<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <rect width="1284" height="2778" fill="#0D0D1A"/>
  <text x="642" y="1300" font-family="Arial" font-size="120" font-weight="bold" fill="#00D4AA" text-anchor="middle">PolyEdge</text>
  <text x="642" y="1420" font-family="Arial" font-size="48" fill="#A0A0B8" text-anchor="middle">Polymarket Intelligence</text>
</svg>`;

  await sharp(Buffer.from(splashSvg))
    .png().toFile(path.join(assetsDir, 'splash.png'));

  console.log('✅ Assets generated successfully');
  console.log('📁 Created:');
  console.log('  - assets/icon.png (1024x1024)');
  console.log('  - assets/adaptive-icon.png (1024x1024)');
  console.log('  - assets/splash.png (1284x2778)');
}

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (error) {
  console.error('❌ Sharp is not installed. Please run: npm install sharp');
  process.exit(1);
}

generateAssets().catch(console.error);