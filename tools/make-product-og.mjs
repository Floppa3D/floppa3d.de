/**
 * Erzeugt je Produkt eine Vorschaukarte (1200×630, JPG) für og:image / twitter:image:
 * links das erste Produktbild (630×630), rechts dunkle Fläche mit Name und Preis.
 * Ausführen: npm i sharp --no-save && node tools/make-product-og.mjs
 * Ausgabe: public/assets/og/produkt-<slug>.jpg (Farben wie tools/make-og.mjs).
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');
const { products } = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/products.json'), 'utf8'));

const BG = '#16181D';
const ACCENT = '#26B99F';
const FG = '#E8ECF0';
const MUTED = '#8A909A';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Bricht Text in Zeilen mit höchstens `max` Zeichen (grobe Schätzung der Breite). */
function umbrechen(text, max) {
  const zeilen = [];
  let z = '';
  for (const wort of text.split(/\s+/)) {
    if (z && (z + ' ' + wort).length > max) { zeilen.push(z); z = wort; } else z = z ? `${z} ${wort}` : wort;
  }
  if (z) zeilen.push(z);
  return zeilen;
}

fs.mkdirSync(path.join(PUB, 'assets/og'), { recursive: true });

for (const p of products) {
  const erstes = p.images[0];
  const ki = p.kiBilder && !(p.echteBilder || []).includes(erstes);
  // Name vor dem Gedankenstrich groß, Zusatz darunter klein
  const [haupt, ...rest] = p.name.split(/\s[–-]\s/);
  const zusatz = rest.join(' – ');
  const hz = umbrechen(haupt, 16);
  const zz = zusatz ? umbrechen(zusatz, 30) : [];
  const x = 690;
  let y = 150;
  let text = `<text x="${x}" y="70" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="2" fill="${ACCENT}">FLOPPA3D</text>`;
  for (const z of hz) { text += `<text x="${x}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="700" fill="${FG}">${esc(z)}</text>`; y += 72; }
  y += 6;
  for (const z of zz) { text += `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="${MUTED}">${esc(z)}</text>`; y += 40; }
  text += `<text x="${x}" y="500" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="700" fill="${ACCENT}">${esc(p.price)}</text>`;
  text += `<text x="${x}" y="570" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="${MUTED}">floppa3d.de</text>`;
  const rechts = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="${BG}"/>${text}</svg>`;

  const bild = await sharp(path.join(PUB, 'assets/products', erstes))
    .resize(630, 630, { fit: 'cover', background: BG }).flatten({ background: '#ffffff' }).toBuffer();
  const lagen = [{ input: bild, left: 0, top: 0 }];
  if (ki) {
    const etikett = `<svg width="220" height="44" xmlns="http://www.w3.org/2000/svg"><rect width="220" height="44" rx="22" fill="${BG}" fill-opacity="0.82"/><text x="110" y="29" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${FG}">Mit KI verbessert</text></svg>`;
    lagen.push({ input: Buffer.from(etikett), left: 18, top: 568 });
  }
  const out = path.join(PUB, 'assets/og', `produkt-${p.slug}.jpg`);
  await sharp(Buffer.from(rechts)).composite(lagen).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  console.log(`→ ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)${ki ? ' [KI-Etikett]' : ''}`);
}
