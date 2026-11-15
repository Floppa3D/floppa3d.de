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
| `public/scripts/` | Die Skripte der Seite |
| `public/_headers` | Sicherheitsregeln (siehe unten) |
| `public/_redirects` | Feste Weiterleitungen; die für Produkte und Artikel entstehen beim Build von selbst |
| `tools/` | Hilfswerkzeuge (Selbsttest, Logos, Bild-Optimierung) |
| `docs/` | Bauregeln (`ASTRO-UMBAU.md`), Analytics-Anleitung; `docs/archiv/` ist der alte Stand |
| `OFFENE-PUNKTE.md` | Was noch von euch fehlt |

## Anleitungen

### Produkt ändern oder hinzufügen
1. `src/data/products.json` öffnen. Ein Produkt ist ein Block in der Liste `products`; die Reihenfolge dort ist die Reihenfolge im Shop.
2. Ändern: Felder im Block anpassen. Neu: einen bestehenden Block kopieren und alle Felder ausfüllen. `slug` ist die Adresse (`/produkte/<slug>.html`), klein geschrieben, ohne Leerzeichen, und darf nur einmal vorkommen.
3. Bilder nach `public/assets/products/<slug>/` legen; im Feld `images` stehen die Dateinamen (PNG). Zu jeder PNG gehört eine WebP-Version; `node tools/optimize-images.mjs` erzeugt sie.
4. `npm test`. Fehlt ein Pflichtfeld, bricht der Build mit einer Meldung ab, die das Feld nennt. Produktseite, Shop-Karte, Sitemap und die Weiterleitung `/produkte/<slug>` entstehen von selbst.

### Etsy-Link eines Produkts eintragen
1. Das Angebot in Etsy öffnen und die Adresse kopieren (`https://www.etsy.com/de/listing/…`).
2. In `src/data/products.json` beim Produkt das Feld `etsyUrl` füllen. Nur Adressen, die mit `https://www.etsy.com/` beginnen, werden angenommen.
3. `npm test`. Der Knopf führt dann direkt zum Angebot („Auf Etsy ansehen"), und die Seite meldet den Preis an Suchmaschinen. Solange `etsyUrl` leer ist, führt der Knopf zum Etsy-Shop (`etsyShopUrl` ganz oben in der Datei).
4. Produkte mit Preis „auf Anfrage" (Auftragsdruck, zurzeit `custom-fonts`) bekommen keinen Etsy-Link; ihr Knopf führt zur Auftragsdruck-Seite.

### Journal-Artikel schreiben
1. In `src/content/journal/` eine neue Datei `mein-artikel.md` anlegen. Der Dateiname ohne `.md` wird zur Adresse (`/journal/mein-artikel.html`).
2. Oben zwischen zwei `---`-Zeilen die Kopfdaten, am besten von einem vorhandenen Artikel kopieren: `title`, `description` (für Suchmaschinen), `eyebrow` (Rubrik), `lead` (Einleitung auf der Artikelseite), `teaser` (Kartentext in der Übersicht), `order` (Reihenfolge, 1 steht oben).
3. Darunter der Text. Zwischenüberschriften wie in den vorhandenen Artikeln: `<h2 class="serif">Überschrift.</h2>`, Absätze als `<p>…</p>`.
4. `npm test`. Übersicht, Artikelseite und Weiterleitung entstehen von selbst.

### Bild oder Video ablegen
- Bilder nach `public/assets/…` (Produkte: `public/assets/products/<slug>/`). Zu jeder PNG die WebP-Version mit `node tools/optimize-images.mjs` erzeugen.
- Hero-Video der Startseite: `public/assets/video/hero-timelapse.mp4` (unter 15 MB). Es wird automatisch eingebunden, sobald die Datei existiert.
- 3D-Modelle: siehe `tools/README-3D.md`. Farbbilder: siehe `OFFENE-PUNKTE.md`.

## Wie die Seite live geht

1. Änderungen auf einem eigenen Branch committen; `npm test` muss grün sein.
2. Pull Request nach `main` öffnen und zusammenführen.
3. Cloudflare baut die Seite (`npm run build`) und liefert den Ordner `dist/` aus. So steht es in `wrangler.jsonc`: Projektname `floppa3d-de`, Build-Befehl `npm run build`, Auslieferung von `./dist` ohne automatische Endungen (deshalb enden alle Adressen auf `.html`; die Weiterleitungen ohne Endung stehen in `_redirects`), Fehlerseite `404.html`. Ob und wie Cloudflare mit dem GitHub-Repository verbunden ist, steht nicht im Code.

## Sicherheitsregel für das Theme-Skript

Die Seite erlaubt keine eingebetteten Skripte außer einem: dem kleinen Theme-Skript (hell/dunkel) im `<head>` von `src/layouts/Basis.astro`. Es ist in `public/_headers` über einen Hash (`sha256-…`) freigegeben. **Wer dieses Skript ändert, muss den Hash in `public/_headers` anpassen**, sonst läuft es im Browser nicht. `npm test` meldet das und nennt den richtigen Hash. Alle anderen Skripte gehören als Datei nach `public/scripts/`.

Weitere feste Regeln (Adressen mit `.html`, keine fremden Server) stehen in `docs/ASTRO-UMBAU.md`.
