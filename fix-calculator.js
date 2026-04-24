const fs = require('fs');
const path = require('path');

// Read the broken file
const filePath = path.join(__dirname, 'SubsidIA/frontend/app/calculadora/page.tsx');
const brokenCode = fs.readFileSync(filePath, 'utf8');

console.log('Reading broken file...');
console.log('File size:', brokenCode.length, 'bytes');
console.log('Last 200 chars:', brokenCode.slice(-200));

// The file is truncated. Let me check what's missing
const lines = brokenCode.split('\n');
console.log('Total lines:', lines.length);
console.log('Last few lines:');
for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}