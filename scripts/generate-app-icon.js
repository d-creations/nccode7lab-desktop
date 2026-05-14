const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const size = 256;
const buildDir = path.join(process.cwd(), 'build');
const pngPath = path.join(buildDir, 'icon.png');
const icoPath = path.join(buildDir, 'icon.ico');

fs.mkdirSync(buildDir, { recursive: true });

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createPng() {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * stride;
    raw[rowStart] = 0;
    for (let x = 0; x < size; x += 1) {
      const pixelStart = rowStart + 1 + x * 4;
      let red = 21;
      let green = 34;
      let blue = 56;
      let alpha = 255;

      const dx = x - size / 2;
      const dy = y - size / 2;
      const radius = Math.sqrt(dx * dx + dy * dy);

      if (radius < 108) {
        red = 35;
        green = 166;
        blue = 240;
      }

      if (x > 56 && x < 100 && y > 68 && y < 188) {
        red = 255;
        green = 255;
        blue = 255;
      }

      if (x > 152 && x < 196 && y > 68 && y < 188) {
        red = 255;
        green = 255;
        blue = 255;
      }

      if (x >= 100 && x <= 152 && y >= 132 && y <= 176) {
        red = 255;
        green = 255;
        blue = 255;
      }

      raw[pixelStart] = red;
      raw[pixelStart + 1] = green;
      raw[pixelStart + 2] = blue;
      raw[pixelStart + 3] = alpha;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const pngBuffer = createPng();
fs.writeFileSync(pngPath, pngBuffer);

const iconHeader = Buffer.alloc(22);
iconHeader.writeUInt16LE(0, 0);
iconHeader.writeUInt16LE(1, 2);
iconHeader.writeUInt16LE(1, 4);
iconHeader[6] = 0;
iconHeader[7] = 0;
iconHeader[8] = 0;
iconHeader[9] = 0;
iconHeader.writeUInt16LE(1, 10);
iconHeader.writeUInt16LE(32, 12);
iconHeader.writeUInt32LE(pngBuffer.length, 14);
iconHeader.writeUInt32LE(22, 18);

fs.writeFileSync(icoPath, Buffer.concat([iconHeader, pngBuffer]));
console.log(`generated ${pngPath}`);
console.log(`generated ${icoPath}`);
