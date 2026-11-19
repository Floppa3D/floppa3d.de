/**
 * Erzeugt WebP-Versionen (Qualität 82):
 *  - zu jeder PNG unter public/assets/ die WebP daneben,
 *  - zu jedem Original unter quellen/bilder/ die WebP unter public/assets/ (gleicher Unterordner).
 *    Die Originale selbst werden nicht ausgeliefert. quellen/bilder/hero/ wird übersprungen.
 * Ausführen: npm i sharp --no-save && node tools/optimize-images.mjs
 */
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, extname, relative, dirname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
import sharp from 'sharp';

async function walk(dir, zielFuer) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) await walk(p, zielFuer);
    else if (p.includes(join('bilder', 'hero'))) continue; // Hero-Foto wird nicht mehr ausgeliefert (Hero nutzt das Video-Standbild)
    else if (extname(p).toLowerCase() === '.png') {
      const out = zielFuer(p);
      await mkdir(dirname(out), { recursive: true });
      await sharp(p).webp({ quality: 82 }).toFile(out);
      console.log('→', out);
    }
  }
}

const PUBLIC_ASSETS = join(ROOT, 'public', 'assets');
const QUELLEN = join(ROOT, 'quellen', 'bilder');
await walk(PUBLIC_ASSETS, (p) => p.replace(/\.png$/i, '.webp'));
await walk(QUELLEN, (p) => join(PUBLIC_ASSETS, relative(QUELLEN, p)).replace(/\.png$/i, '.webp'));
