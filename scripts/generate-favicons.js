const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createIco(pngBuffers) {
  // pngBuffers: Array of { width: number, height: number, buffer: Buffer }
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Image data size
    entry.writeUInt32LE(offset, 12); // Offset of image data
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

async function main() {
  console.log('Extracting emblem from logo...');
  const logoPath = path.join(__dirname, '../public/assets/images/recruitment_insti_final_02.png');

  // Extract emblem (columns 0..127, rows 0..135)
  const emblemRaw = await sharp(logoPath)
    .extract({ left: 0, top: 0, width: 128, height: 136 })
    .toBuffer();

  // Resize emblem to fit nicely inside 512x512 with optimal size for favicon readability (430x430)
  const emblemResized = await sharp(emblemRaw)
    .resize(430, 430, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  // Create solid white squircle background (so it is 100% visible on dark theme tabs)
  const bgSvg = Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="80" fill="#ffffff" stroke="#cbd5e1" stroke-width="8" />
    </svg>
  `);

  // Composite emblem on top of solid white squircle
  const base512 = await sharp(bgSvg)
    .composite([{ input: emblemResized, gravity: 'center' }])
    .png()
    .toBuffer();

  const buf16 = await sharp(base512).resize(16, 16).png().toBuffer();
  const buf32 = await sharp(base512).resize(32, 32).png().toBuffer();
  const buf48 = await sharp(base512).resize(48, 48).png().toBuffer();
  const buf180 = await sharp(base512).resize(180, 180).png().toBuffer();
  const buf192 = await sharp(base512).resize(192, 192).png().toBuffer();
  const buf512 = base512;

  // Create ICO buffer containing 16, 32, 48 sizes
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 },
    { width: 48, height: 48, buffer: buf48 },
  ]);

  // Write all PNG / ICO icons
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), buf512);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), buf180);
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoBuffer);

  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-16x16.png'), buf16);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-32x32.png'), buf32);
  fs.writeFileSync(path.join(__dirname, '../public/favicon-48x48.png'), buf48);
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), buf180);
  fs.writeFileSync(path.join(__dirname, '../public/android-chrome-192x192.png'), buf192);
  fs.writeFileSync(path.join(__dirname, '../public/android-chrome-512x512.png'), buf512);

  // Create dark-theme aware SVG favicon
  const adaptiveSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.12" />
    </filter>
  </defs>
  <style>
    .bg { fill: #ffffff; stroke: #cbd5e1; stroke-width: 6px; }
    .frame { stroke: #0f172a; }
    .accent { fill: #1d4ed8; }
    @media (prefers-color-scheme: dark) {
      .bg { fill: #ffffff; stroke: #94a3b8; stroke-width: 6px; }
      .frame { stroke: #0f172a; }
      .accent { fill: #1d4ed8; }
    }
  </style>
  <rect class="bg" width="512" height="512" rx="100" filter="url(#shadow)" />
  <g transform="translate(86, 86)">
    <rect class="frame" x="0" y="0" width="340" height="340" fill="#ffffff" stroke-width="32" rx="4" />
    <path d="M 120 70 L 120 130 C 120 130, 220 50, 220 130 C 220 200, 140 210, 140 210 L 220 300" fill="none" class="frame" stroke-width="28" stroke-linecap="square" />
    <circle cx="120" cy="150" r="32" class="accent" />
    <path d="M 112 195 L 128 195 L 134 265 L 120 290 L 106 265 Z" class="accent" />
  </g>
</svg>`;

  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), adaptiveSvg);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), adaptiveSvg);

  console.log('✅ Favicon suite successfully generated!');
}

main().catch(console.error);
