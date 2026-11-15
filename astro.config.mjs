// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

/* Weiterleitungen ohne ".html": die festen Zeilen stehen in public/_redirects,
   die Zeilen für Produkte und Journal-Artikel entstehen hier aus den Daten.
   (Je Slug eine Zeile — ein Platzhalter würde auch /produkte/x.html treffen → Schleife.) */
function redirectsAusDaten() {
  const sortiert = (liste) => liste.sort((a, b) => a.order - b.order);
  return {
    name: 'floppa3d-redirects',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const wurzel = fileURLToPath(new URL('./', import.meta.url));
        const fest = fs.readFileSync(path.join(wurzel, 'public', '_redirects'), 'utf8').trimEnd();

        const produkte = JSON.parse(fs.readFileSync(path.join(wurzel, 'src/data/products.json'), 'utf8')).products
          .map((p) => `/produkte/${p.slug} /produkte/${p.slug}.html 301`);

        const journalDir = path.join(wurzel, 'src/content/journal');
        const artikel = fs.readdirSync(journalDir).filter((f) => f.endsWith('.md')).map((f) => {
          const kopf = fs.readFileSync(path.join(journalDir, f), 'utf8');
          const order = Number(kopf.match(/^order:\s*(\d+)/m)?.[1] ?? 99);
          return { slug: f.replace(/\.md$/, ''), order };
        });
        const journal = sortiert(artikel).map((a) => `/journal/${a.slug} /journal/${a.slug}.html 301`);

        const text = [fest, '', '# Erzeugt beim Build aus products.json und src/content/journal', ...produkte, ...journal].join('\n') + '\n';
        fs.writeFileSync(path.join(fileURLToPath(dir), '_redirects'), text);
      },
    },
  };
}

/* Adressen bleiben exakt wie bei der alten Seite: about.html, shop.html,
   produkte/<slug>.html. Dafür 'preserve' + trailingSlash 'never'.
   Astro bettet keine eigenen Skripte ein — alle Skripte liegen als Dateien
   in public/scripts/ (CSP erlaubt nur 'self' und den Hash des Theme-Skripts). */
export default defineConfig({
  site: 'https://floppa3d.de',
  trailingSlash: 'never',
  build: { format: 'preserve' },
  integrations: [redirectsAusDaten()],
});
