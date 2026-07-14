// One-off script: generates assets/icon.png — the PowerDown logo:
// a yellow rounded square with a black power ring and a down arrow
// passing through the gap at the top. Run with: node assets/generate-icon.cjs
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 512;
const YELLOW = [255, 214, 10, 255]; // #FFD60A
const BLACK = [17, 17, 17, 255]; // #111111
const TRANSPARENT = [0, 0, 0, 0];

const CX = SIZE / 2;
const CY = SIZE / 2 + 10; // ring center, nudged down so the arrow can poke through the top gap

// rounded-square background
const RECT_MARGIN = 16;
const RECT_RADIUS = 96;

// power ring
const RING_OUTER = 150;
const RING_INNER = 110;
const GAP_HALF_ANGLE = 42; // degrees, gap centered at the top (-90°)

// down arrow: shaft + triangular head
const SHAFT_HALF_WIDTH = 22;
const SHAFT_TOP = 90;
const HEAD_TOP = 250;
const HEAD_BOTTOM = 340;
const HEAD_HALF_WIDTH = 66;

function insideRoundedSquare(x, y) {
  const half = SIZE / 2 - RECT_MARGIN;
  const qx = Math.abs(x - SIZE / 2) - (half - RECT_RADIUS);
  const qy = Math.abs(y - SIZE / 2) - (half - RECT_RADIUS);
  const dist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - RECT_RADIUS;
  return dist <= 0;
}

function insideGlyph(x, y) {
  const dx = x - CX;
  const dy = y - CY;
  const dist = Math.hypot(dx, dy);

  const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180, -90 is up
  const inGap = angle > -90 - GAP_HALF_ANGLE && angle < -90 + GAP_HALF_ANGLE;
  if (dist >= RING_INNER && dist <= RING_OUTER && !inGap) return true;

  if (Math.abs(dx) <= SHAFT_HALF_WIDTH && y >= SHAFT_TOP && y <= HEAD_TOP) return true;

  if (y >= HEAD_TOP && y <= HEAD_BOTTOM) {
    const t = (y - HEAD_TOP) / (HEAD_BOTTOM - HEAD_TOP);
    if (Math.abs(dx) <= HEAD_HALF_WIDTH * (1 - t)) return true;
  }

  return false;
}

// 2x2 supersampling for smoother edges
function pixelColor(px, py) {
  let r = 0, g = 0, b = 0, a = 0;
  for (const ox of [0.25, 0.75]) {
    for (const oy of [0.25, 0.75]) {
      const x = px + ox;
      const y = py + oy;
      let c = TRANSPARENT;
      if (insideRoundedSquare(x, y)) c = insideGlyph(x, y) ? BLACK : YELLOW;
      r += c[0]; g += c[1]; b += c[2]; a += c[3];
    }
  }
  return [r / 4, g / 4, b / 4, a / 4].map(Math.round);
}

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(SIZE, 0);
ihdrData.writeUInt32BE(SIZE, 4);
ihdrData[8] = 8; // bit depth
ihdrData[9] = 6; // color type RGBA
ihdrData[10] = 0;
ihdrData[11] = 0;
ihdrData[12] = 0;
const ihdr = chunk('IHDR', ihdrData);

const raw = Buffer.alloc(SIZE * (1 + SIZE * 4));
for (let y = 0; y < SIZE; y++) {
  const rowStart = y * (1 + SIZE * 4);
  raw[rowStart] = 0; // filter type none
  for (let x = 0; x < SIZE; x++) {
    const [r, g, b, a] = pixelColor(x, y);
    const off = rowStart + 1 + x * 4;
    raw[off] = r;
    raw[off + 1] = g;
    raw[off + 2] = b;
    raw[off + 3] = a;
  }
}

const idat = chunk('IDAT', zlib.deflateSync(raw));
const iend = chunk('IEND', Buffer.alloc(0));

const png = Buffer.concat([signature, ihdr, idat, iend]);
const outPath = path.join(__dirname, 'icon.png');
fs.writeFileSync(outPath, png);
console.log('Wrote', outPath, png.length, 'bytes');
