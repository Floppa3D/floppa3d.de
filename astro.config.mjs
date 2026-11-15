// @ts-check
import { defineConfig } from 'astro/config';

/* Adressen bleiben exakt wie bei der alten Seite: about.html, shop.html,
   produkte/<slug>.html. Dafür 'preserve' + trailingSlash 'never'.
   Astro bettet keine eigenen Skripte ein — alle Skripte liegen als Dateien
   in public/scripts/ (CSP erlaubt nur 'self' und den Hash des Theme-Skripts). */
export default defineConfig({
  site: 'https://floppa3d.de',
  trailingSlash: 'never',
  build: { format: 'preserve' },
});
