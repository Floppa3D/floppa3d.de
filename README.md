# floppa3d.de

Die Website von Floppa3D (3D-gedruckte Pflanztöpfe und Deko, Flo und Paul). Eine statische Seite, gebaut mit [Astro](https://astro.build): Aus den Dateien in `src/` entsteht beim Build der fertige Ordner `dist/`. Verkauft wird über Etsy; die Seite ist das Schaufenster.

Man muss Astro nicht kennen. Texte und Produkte stehen in normalen Textdateien (JSON, Markdown).

## Voraussetzungen

- Node.js (getestet mit Version 24) und Git
- einmalig im Projektordner: `npm install`

## Die drei Befehle

| Befehl | Was er tut |
|---|---|
| `npm run dev` | Startet die Seite lokal zum Ansehen (die Adresse steht im Terminal). Änderungen erscheinen sofort. |
| `npm run build` | Baut die fertige Seite nach `dist/`. |
| `npm test` | Baut und prüft das Ergebnis: tote Links, Platzhalter, fremde Server, eingebettete Skripte. Muss grün sein, bevor etwas live geht. |

## Wo liegt was

| Ort | Inhalt |
|---|---|
| `src/data/products.json` | Alle Produkte (Texte, Preise, Farben, Bilder, Etsy-Links) und der Link zum Etsy-Shop |
| `src/content/journal/` | Journal-Artikel als Markdown-Dateien |
| `src/pages/` | Die Seiten (Start, Shop, Über uns, FAQ, Kontakt, Rechtstexte …) |
| `src/components/`, `src/layouts/` | Wiederverwendete Bausteine (Kopf, Fuß, Kaufen-Knopf …) |
| `src/styles/` | Gestaltung (CSS) |
| `public/assets/` | Bilder, Logos, Schriften — liegen im Netz unter derselben Adresse (`/assets/…`) |
| `quellen/bilder/` | Große PNG-Originale, aus denen die WebP für Kategorien und Hero entstehen — werden nicht ausgeliefert |
| `public/scripts/` | Die Skripte der Seite |
| `public/_headers` | Sicherheitsregeln (siehe unten) |
| `public/_redirects` | Feste Weiterleitungen; die für Produkte und Artikel entstehen beim Build von selbst |
| `tools/` | Hilfswerkzeuge (Selbsttest, Logos, Bild-Optimierung) |
| `docs/` | Bauregeln (`ASTRO-UMBAU.md`), Analytics-Anleitung; `docs/archiv/` ist der alte Stand |
| `OFFENE-PUNKTE.md` | Was noch von euch fehlt |

## Anleitungen

### Produkt ändern oder hinzufügen
1. `src/data/products.json` öffnen. Ein Produkt ist ein Block in der Liste `products`; die Reihenfolge dort ist die Reihenfolge im Shop.
2. Ändern: Felder im Block anpassen. Neu: einen bestehenden Block kopieren (mit Komma dahinter einfügen) und ausfüllen.
3. Nach dem Kopieren müsst ihr diese Felder auf jeden Fall ändern, sonst gehört der neue Block noch zum alten Produkt:
   - `slug`: die Adresse des Produkts (`/produkte/<slug>.html`). Nur Kleinbuchstaben, Ziffern und Bindestriche, keine Leerzeichen. Jeder slug darf nur einmal vorkommen.
   - `modelId`, `name`, `price` (so, wie es auf der Seite stehen soll, z. B. `22,00 €`) und `priceNumeric` (derselbe Preis mit Punkt, z. B. `22.00`; bei Preis auf Anfrage leer lassen).
   - `shortDescription`, `longDescription`, `details`, `colors`, `tags`.
   - `images` (siehe unten) und `etsyUrl` (leer lassen, bis es das Angebot bei Etsy gibt).
4. `category` und `categoryLabel` gehören zusammen. Erlaubt sind nur diese Paare:

   | `category` | `categoryLabel` |
   |---|---|
   | `blumen` | `Blume` |
   | `organisation` | `Organisation` |
   | `deko` | `Deko` |
   | `auftragsdruck` | `Auftragsdruck` |

   Der Shop-Filter kennt Blume, Organisation und Deko. Steht bei `category` etwas anderes (auch nur ein Tippfehler wie `blume`), bricht der Build ab.
5. `kiBilder` (Pflichtfeld, ohne Vorgabe): `true`, wenn die Produktbilder mit KI verbessert, bearbeitet oder erstellt wurden, sonst `false`. Bei `true` zeigen Produktkarten (Shop, Startseite, „Verwandte Stücke“) und die Galerie der Produktseite ein kleines Etikett „Mit KI verbessert“ in der Bildecke, unter der Galerie steht zusätzlich ein Hinweissatz. Das Feld hat absichtlich keinen Standardwert: Bei jedem neuen Produkt muss bewusst entschieden werden, ob die Bilder KI-Anteile haben. Fehlt es, bricht der Build mit einer Meldung ab, die sagt, was einzutragen ist. Die Etiketten auf Hero und Kategorie-Kacheln der Startseite stehen fest in `src/pages/index.astro`.
   Optional `imageAlts`: eine Liste mit je einem beschreibenden Alt-Text pro Bild, in derselben Reihenfolge wie `images` (gleiche Anzahl, sonst bricht der Build ab). Ohne `imageAlts` gilt der Produktname als Alt-Text des ersten Bildes.
6. `featured`: `true` zeigt das Produkt auf der Startseite im Bereich „Ausgewählt“, `false` nur im Shop.
7. `images`: eine Liste von Pfaden, jeweils ab `public/assets/products/` gerechnet, also zum Beispiel `"mein-topf/01.png"`. Die erste Datei ist das Titelbild, die zweite erscheint beim Darüberfahren in der Shop-Karte. Es müssen PNG-Dateien sein. Zu jeder PNG muss eine WebP-Datei mit demselben Namen im selben Ordner liegen (`01.png` und `01.webp`); die Seite lädt die WebP und nimmt die PNG nur als Ersatz. `node tools/optimize-images.mjs` erzeugt die WebP-Dateien.
8. `npm test` ausführen. Das passiert dann:
   - Fehlt ein Pflichtfeld (zum Beispiel `price` oder `kiBilder`), oder ist `category` ungültig, bricht der Build ab und nennt Produkt und Feld.
   - Fehlt der `slug` oder kommt er doppelt vor, bricht der Build ebenfalls ab. Die Meldung nennt `src/data/products.json` und das Produkt (Nummer in der Liste und Name).
   - Fehlt eine Bilddatei (PNG oder WebP), baut die Seite zwar, aber `npm test` meldet einen „toten Verweis“ mit dem Dateipfad. Dann darf nichts live gehen.
   - Sind alle Angaben in Ordnung, entstehen Produktseite, Shop-Karte, Eintrag in der Sitemap und die Weiterleitung `/produkte/<slug>` von selbst.

### Etsy-Link eines Produkts eintragen
1. Das Angebot in Etsy öffnen und die Adresse kopieren (`https://www.etsy.com/de/listing/…`).
2. In `src/data/products.json` beim Produkt das Feld `etsyUrl` füllen. Nur Adressen, die mit `https://www.etsy.com/` beginnen, werden angenommen.
3. `npm test`. Der Knopf führt dann direkt zum Angebot („Auf Etsy ansehen"), und die Seite meldet den Preis an Suchmaschinen. Solange `etsyUrl` leer ist, führt der Knopf zum Etsy-Shop (`etsyShopUrl` ganz oben in der Datei).
4. Produkte mit Preis „auf Anfrage" (Auftragsdruck, zurzeit `custom-fonts`) bekommen keinen Etsy-Link; ihr Knopf führt zur Auftragsdruck-Seite.

### Journal-Artikel schreiben
1. In `src/content/journal/` eine neue Datei `mein-artikel.md` anlegen. Der Dateiname ohne `.md` wird zur Adresse (`/journal/mein-artikel.html`): klein geschrieben, ohne Leerzeichen.
2. Oben zwischen zwei `---`-Zeilen stehen die Kopfdaten. Am besten kopiert ihr sie von einem vorhandenen Artikel. Alle Felder außer `order` sind Pflicht:
   - `title`: Überschrift des Artikels.
   - `description`: ein bis zwei Sätze für Suchmaschinen.
   - `eyebrow`: die kurze Rubrik über der Überschrift, z. B. „Pflege“.
   - `lead`: die Einleitung direkt unter der Überschrift auf der Artikelseite.
   - `teaser`: der Text auf der Karte in der Journal-Übersicht (er erscheint nur dort, nicht im Artikel).
   - `order`: die Reihenfolge in der Übersicht und in der Sitemap. 1 steht oben, dann 2, 3 und so weiter. Fehlt `order`, steht der Artikel ganz hinten.
3. Darunter der Text. Zwischenüberschriften wie in den vorhandenen Artikeln: `<h2 class="serif">Überschrift.</h2>`, Absätze als `<p>…</p>`.
4. `npm test`. Fehlt ein Pflichtfeld, bricht der Build ab und nennt Artikel und Feld. Sonst entstehen Artikelseite, Karte in der Übersicht, Eintrag in der Sitemap und die Weiterleitung `/journal/mein-artikel` von selbst.

### Bild oder Video ablegen
- Bilder nach `public/assets/…` (Produkte: `public/assets/products/<slug>/`). Zu jeder PNG die WebP-Version mit `node tools/optimize-images.mjs` erzeugen. Große Originale, die nur als WebP gebraucht werden (Kategorie- und Hero-Bilder), kommen nach `quellen/bilder/<Unterordner>/`; das Skript schreibt die WebP dann nach `public/assets/<Unterordner>/`.
- Hero-Video der Auftragsdruck-Seite (`src/pages/auftragsdruck.astro`, `.hero--video`): vier Dateien in `public/assets/video/`: `hero-timelapse.mp4` (1920×1080), `hero-timelapse-720.mp4` (1280×720, für Bildschirme unter 768 px), dazu die Standbilder `hero-timelapse-poster.webp` und `hero-timelapse-poster-720.webp`. Die Standbilder sind der Hero-Hintergrund dieser Seite (auch ohne JavaScript und bei Reduced-Motion, dort startet das Video erst per Knopf „Zeitraffer abspielen“). Austauschen mit ffmpeg (Quelle ohne Ton, Standbild bei Sekunde 4,5; Video unter 15 MB):
  ```
  ffmpeg -i quelle.mp4 -an -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -movflags +faststart hero-timelapse.mp4
  ffmpeg -i quelle.mp4 -an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p -movflags +faststart hero-timelapse-720.mp4
  ffmpeg -ss 4.5 -i quelle.mp4 -frames:v 1 -c:v libwebp -quality 80 hero-timelapse-poster.webp
  ffmpeg -ss 4.5 -i quelle.mp4 -frames:v 1 -vf scale=1280:-2 -c:v libwebp -quality 78 hero-timelapse-poster-720.webp
  ```
- 3D-Modelle: siehe `tools/README-3D.md`. Farbbilder: siehe `OFFENE-PUNKTE.md`.

## Wie die Seite live geht

1. Änderungen auf einem eigenen Branch committen; `npm test` muss grün sein.
2. Pull Request nach `main` öffnen und zusammenführen.
3. Cloudflare baut die Seite (`npm run build`) und liefert den Ordner `dist/` aus. So steht es in `wrangler.jsonc`: Projektname `floppa3d-de`, Build-Befehl `npm run build`, Auslieferung von `./dist` ohne automatische Endungen (deshalb enden alle Adressen auf `.html`; die Weiterleitungen ohne Endung stehen in `_redirects`), Fehlerseite `404.html`. Ob und wie Cloudflare mit dem GitHub-Repository verbunden ist, steht nicht im Code.

## Sicherheitsregel für das Theme-Skript

Die Seite erlaubt keine eingebetteten Skripte außer einem: dem kleinen Theme-Skript (hell/dunkel) im `<head>` von `src/layouts/Basis.astro`. Es ist in `public/_headers` über einen Hash (`sha256-…`) freigegeben. **Wer dieses Skript ändert, muss den Hash in `public/_headers` anpassen**, sonst läuft es im Browser nicht. `npm test` meldet das und nennt den richtigen Hash. Alle anderen Skripte gehören als Datei nach `public/scripts/`.

Weitere feste Regeln (Adressen mit `.html`, keine fremden Server) stehen in `docs/ASTRO-UMBAU.md`.
