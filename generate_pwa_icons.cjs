const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create valid uncompressed/deflated RGBA PNG
function createPng(width, height, pixelFn) {
  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crc = crc32(chunk.subarray(4, 8 + len));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace: none
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines (Filter type 0 + RGBA pixels)
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate festive Ganesha medallion icon
function festiveGaneshaPixel(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background gradient: Deep royal maroon (#26050C) to (#420A15)
  let r = Math.floor(38 + (1 - dist) * 25);
  let g = Math.floor(5 + (1 - dist) * 10);
  let b = Math.floor(12 + (1 - dist) * 15);
  let a = 255;

  // Outer golden circular ring
  if (dist >= 0.85 && dist <= 0.92) {
    const ringGlow = 1 - Math.abs(dist - 0.885) / 0.035;
    r = Math.floor(r * (1 - ringGlow) + 212 * ringGlow);
    g = Math.floor(g * (1 - ringGlow) + 175 * ringGlow);
    b = Math.floor(b * (1 - ringGlow) + 55 * ringGlow);
  }

  // Inner golden decorative ring
  if (dist >= 0.76 && dist <= 0.79) {
    r = Math.min(255, r + 180);
    g = Math.min(255, g + 140);
    b = Math.min(255, b + 40);
  }

  // Central golden glow aura
  if (dist < 0.65) {
    const aura = Math.max(0, 1 - dist / 0.65);
    r = Math.min(255, Math.floor(r + aura * 80));
    g = Math.min(255, Math.floor(g + aura * 45));
    b = Math.min(255, Math.floor(b + aura * 10));
  }

  // Sacred Om / Tilak symbol silhouette in center
  // Vertical Tilak line
  if (Math.abs(nx) < 0.045 && ny > -0.45 && ny < 0.15) {
    return [245, 158, 11, 255]; // Golden saffron
  }
  // Red Bindi
  const bindiDist = Math.sqrt(nx * nx + (ny + 0.18) * (ny + 0.18));
  if (bindiDist < 0.065) {
    return [220, 38, 38, 255]; // Crimson sindoor
  }
  // Crescent below
  const crescentDist = Math.sqrt(nx * nx + (ny - 0.08) * (ny - 0.08));
  if (crescentDist < 0.22 && crescentDist > 0.15 && ny > -0.02) {
    return [253, 230, 138, 255]; // Bright gold
  }

  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b)), a];
}

const publicDir = path.join(__dirname, 'public');

console.log('Generating PWA icons in public directory...');
const png192 = createPng(192, 192, festiveGaneshaPixel);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('Created pwa-192x192.png');

const png512 = createPng(512, 512, festiveGaneshaPixel);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('Created pwa-512x512.png');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png192);
console.log('Created apple-touch-icon.png');

console.log('All PWA icons generated successfully!');
