// news-image-20261117 — a program that writes one image summing up the world
// news of Tuesday 17 November 2026 to /output/entry.png.
//
// The image is entry.png beside this file: a vintage broadsheet front page,
// "THE WORLD", dated Tuesday 17 November 2026, with the day's four biggest
// verified stories as legible headlines (Hormuz tankers hit, bridges under
// fire, Shenzhen summit set, Europe's Rwanda hub) plus an IN BRIEF strip.
// Every story was verified against two or more news sources before the image
// was made; nothing was invented.
//
// The program copies that image verbatim to the output directory the kit
// names (MAKEFUN_OUTPUT_DIR, else /output). It refuses to write anything
// unless the source exists, is a whole PNG (every chunk CRC verified, ending
// exactly at IEND), is at most 1 MiB, and is at most 1024 by 1024 pixels —
// the gate limits. No network, no randomness, no timestamps: two runs write
// the same bytes. The copy is checked after the fact by comparing the written
// file byte for byte with the source, so a silent partial write cannot pass
// unnoticed.
//
// Run it (Node 22, standard library only):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   ls -l out/entry.png

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const MAX_BYTES = 1048576; // 1 MiB
const MAX_DIMENSION = 1024;

const sourcePath = new URL('./entry.png', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outputPath = join(outputDir, 'entry.png');

if (!existsSync(sourcePath)) {
  throw new Error('entry.png is missing next to main.ts');
}

const bytes = readFileSync(sourcePath);

// Whole-PNG check: PNG signature, then walk every chunk, verifying each
// chunk's CRC32 and stopping exactly at IEND with nothing trailing.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (bytes.length < 8 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('entry.png is not a PNG');
}

// CRC32 (IEEE) table, built once.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

let offset = 8;
let width = 0;
let height = 0;
let sawIEND = false;
while (offset + 8 <= bytes.length) {
  const length = bytes.readUInt32BE(offset);
  const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
  const dataStart = offset + 8;
  const dataEnd = dataStart + length;
  if (dataEnd + 4 > bytes.length) {
    throw new Error(`entry.png is truncated inside chunk ${type}`);
  }
  const storedCrc = bytes.readUInt32BE(dataEnd);
  const computedCrc = crc32(Buffer.concat([bytes.subarray(offset + 4, offset + 8), bytes.subarray(dataStart, dataEnd)]));
  if (storedCrc !== computedCrc) {
    throw new Error(`entry.png chunk ${type} fails its CRC check`);
  }
  if (type === 'IHDR') {
    width = bytes.readUInt32BE(dataStart);
    height = bytes.readUInt32BE(dataStart + 4);
  }
  offset = dataEnd + 4;
  if (type === 'IEND') {
    sawIEND = true;
    break;
  }
}
if (!sawIEND || offset !== bytes.length) {
  throw new Error('entry.png is not a whole PNG (missing IEND or trailing bytes)');
}
if (width === 0 || height === 0) {
  throw new Error('entry.png has no IHDR chunk');
}
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}
if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, outputPath);

const written = readFileSync(outputPath);
if (!written.equals(bytes)) {
  throw new Error('output differs from entry.png');
}
console.log(
  `wrote ${outputPath} (${width}x${height}, ${bytes.length} bytes, ` +
    `sha256 ${createHash('sha256').update(bytes).digest('hex')})`,
);
