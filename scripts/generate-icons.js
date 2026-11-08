import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function makePng(width, height, isMaskable = false) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Generate pixel scanlines
  const scanlines = [];
  const cx = width / 2;
  const cy = height / 2;
  const safeRadius = Math.min(width, height) * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const offset = 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient background: indigo-600 (#4f46e5 = 79, 70, 229) to slate-900 (#0f172a = 15, 23, 42)
      const gradT = (x + y) / (width + height);
      let r = Math.round(79 * (1 - gradT) + 30 * gradT);
      let g = Math.round(70 * (1 - gradT) + 40 * gradT);
      let b = Math.round(229 * (1 - gradT) + 120 * gradT);
      let a = 255;

      // Outer squircle or circle if not maskable
      if (!isMaskable) {
        const cornerR = width * 0.22;
        const qx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
        const cornerDist = Math.sqrt(qx * qx + qy * qy);
        if (cornerDist > cornerR) {
          a = 0;
        }
      }

      // Draw central plate ring
      if (a > 0 && Math.abs(dist - safeRadius * 0.85) < Math.max(2, width * 0.015)) {
        r = 255; g = 255; b = 255; a = Math.round(a * 0.4);
      }

      // Draw central 'M' monogram and dining tray
      if (a > 0) {
        // Cloche Dome
        const domeHeight = safeRadius * 0.55;
        if (dy < 0 && dy > -domeHeight && dist < safeRadius * 0.65) {
          r = 255; g = 255; b = 255; a = 255;
        }
        // Cloche Tray base
        if (dy >= 0 && dy <= width * 0.035 && Math.abs(dx) <= safeRadius * 0.72) {
          r = 255; g = 255; b = 255; a = 255;
        }
        // Cloche knob
        if (Math.sqrt(dx * dx + (dy + domeHeight) * (dy + domeHeight)) <= width * 0.04) {
          r = 255; g = 255; b = 255; a = 255;
        }
        // Green badge at bottom-right
        const badgeCx = cx + safeRadius * 0.45;
        const badgeCy = cy + safeRadius * 0.4;
        const badgeDist = Math.sqrt((x - badgeCx) * (x - badgeCx) + (y - badgeCy) * (y - badgeCy));
        if (badgeDist <= width * 0.14) {
          if (badgeDist >= width * 0.12) {
            r = 255; g = 255; b = 255; a = 255;
          } else {
            // Emerald #10b981
            r = 16; g = 185; b = 129; a = 255;
          }
        }
      }

      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    scanlines.push(row);
  }

  const rawData = Buffer.concat(scanlines);
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all target PNGs
fs.mkdirSync('./public', { recursive: true });

fs.writeFileSync('./public/pwa-192x192.png', makePng(192, 192, false));
fs.writeFileSync('./public/pwa-512x512.png', makePng(512, 512, false));
fs.writeFileSync('./public/pwa-maskable-512x512.png', makePng(512, 512, true));
fs.writeFileSync('./public/apple-touch-icon.png', makePng(180, 180, false));
fs.writeFileSync('./public/favicon.ico', makePng(32, 32, false));

console.log('Generated all PWA compliant icons in /public: 192x192, 512x512, maskable, apple-touch-icon, favicon');
