import fs from 'node:fs';
import path from 'node:path';

const CACHE = new Map<string, { width: number; height: number } | null>();

/** Echte PNG-Maße aus dem IHDR-Header; `src` beginnt mit "/assets/…" (liegt unter public/). */
export function pngDimensions(src: string) {
  if (CACHE.has(src)) return CACHE.get(src)!;
  let dims: { width: number; height: number } | null = null;
  try {
    const fd = fs.openSync(path.join(process.cwd(), 'public', src), 'r');
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    if (buf.readUInt32BE(12) === 0x49484452) { // "IHDR"
      dims = { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
  } catch { /* Datei fehlt → Fallback-Maße des Aufrufers */ }
  CACHE.set(src, dims);
  return dims;
}
