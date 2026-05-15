const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname);

const png1x1 = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF, 0x61, 0x00, 0x00, 0x00, 0x19, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x62, 0x64, 0x60, 0x60, 0xF8, 0xCF, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x00, 0x0E, 0x33, 0x00, 0x01, 0x77, 0xA6, 0x4A, 0x1D, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

fs.writeFileSync(path.join(assetsDir, 'tray-icon.png'), png1x1);

const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);

const icoEntry = Buffer.alloc(16);
icoEntry.writeUInt8(32, 0);
icoEntry.writeUInt8(32, 1);
icoEntry.writeUInt8(0, 2);
icoEntry.writeUInt8(0, 3);
icoEntry.writeUInt32LE(png1x1.length, 4);
icoEntry.writeUInt32LE(22, 8);

const icoBuffer = Buffer.concat([icoHeader, icoEntry, png1x1]);
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuffer);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F5E6D3"/>
      <stop offset="100%" style="stop-color:#E8D5C4"/>
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="120" fill="url(#bg)"/>
  <ellipse cx="128" cy="140" rx="70" ry="45" fill="#F5E6D3"/>
  <ellipse cx="128" cy="100" rx="50" ry="40" fill="#F5E6D3"/>
  <ellipse cx="65" cy="70" rx="22" ry="40" fill="#8D6E63"/>
  <ellipse cx="191" cy="70" rx="22" ry="40" fill="#8D6E63"/>
  <ellipse cx="100" cy="95" rx="12" ry="14" fill="#FFFFFF"/>
  <ellipse cx="156" cy="95" rx="12" ry="14" fill="#FFFFFF"/>
  <ellipse cx="103" cy="98" rx="8" ry="10" fill="#5D4037"/>
  <ellipse cx="159" cy="98" rx="8" ry="10" fill="#5D4037"/>
  <ellipse cx="105" cy="95" rx="3" ry="3" fill="#FFFFFF"/>
  <ellipse cx="161" cy="95" rx="3" ry="3" fill="#FFFFFF"/>
  <ellipse cx="128" cy="125" rx="14" ry="10" fill="#4E342E"/>
  <ellipse cx="125" cy="122" rx="5" ry="3" fill="#6D4C41"/>
  <path d="M115 140 Q128 152 141 140" stroke="#8D6E63" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="128" cy="180" rx="45" ry="15" fill="#FFF8F0"/>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgContent);

console.log('Assets created successfully!');
