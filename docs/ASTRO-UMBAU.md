# Astro-Umbau — Vertrag für alle Beteiligten

Ziel: Der selbst gebaute Generator (`build.js` + `templates/` + `pages/`) wird durch
Astro ersetzt. **Gestaltung, Texte und Adressen bleiben 1:1.** Es ist ein Techniktausch,
keine Neugestaltung. Inhaltliche Änderungen kommen erst danach in einem eigenen Schritt.

Arbeitsverzeichnis: `F:\floppa\floppa3d.de`, Branch `feat/astro`.
Vergleichsstand der alten Seite (fertig gebautes HTML, Stand `main`): Pfad steht im Auftrag.

## Harte Regeln

1. **Adressen bleiben exakt gleich**, mit `.html`:
   `/index.html` (kanonisch `/`), `/shop.html`, `/about.html`, `/agb.html`,
   `/auftragsdruck.html`, `/datenschutz.html`, `/faq.html`, `/impressum.html`,
   `/kontakt.html`, `/material.html`, `/404.html`, `/journal/index.html`,
   `/journal/pla-vs-petg.html`, `/journal/3d-druck-deko-pflegen.html`,
   `/produkte/<slug>.html`, `/sitemap.xml`, `/robots.txt`, `/site.webmanifest`.
   Dafür `build.format: 'preserve'` und `trailingSlash: 'never'`. Interne Links behalten `.html`.
2. **Der `<head>` bleibt inhaltlich gleich**: Titel, Beschreibung, Canonical, Open Graph,
   Twitter, Icons, Manifest, theme-color, JSON-LD (gleiche Daten; Formatierung egal).
3. **Der sichtbare Inhalt und die Klassen/Attribute des HTML bleiben gleich** — CSS und
   Skripte hängen daran (`data-*`, `class`, `id`, `style="view-transition-name: …"`).
4. **Sicherheitsregel (CSP) in `_headers`:** `script-src 'self'` plus genau ein Hash für das
   eingebettete Theme-Skript. Deshalb:
   - Das Theme-Skript im `<head>` als `<script is:inline>` mit unverändertem Inhalt.
   - Alle anderen Skripte bleiben eigene Dateien unter `public/scripts/` und werden mit
     `<script is:inline type="module" src="/scripts/….js"></script>` eingebunden.
     Astro darf **kein** weiteres Skript ins HTML einbetten.
   - JSON-LD (`<script type="application/ld+json">`) ist kein ausführbares Skript und bleibt erlaubt;
     mit `set:html={JSON.stringify(daten)}` ausgeben.
5. **Keine fremden Server.** Schriften, Skripte, Bilder alles vom eigenen Server.
6. **Bewegung** nur hinter `prefers-reduced-motion` — das vorhandene CSS/JS regelt das
   schon; nichts daran ändern.
7. Kommentare und Bezeichner in der Art des vorhandenen Codes (deutsche Kommentare, sparsam).
8. Nicht committen, nicht pushen, nicht deployen — das macht die Steuerung.

## Zielstruktur

```
astro.config.mjs          site: https://floppa3d.de, build.format 'preserve'
src/
  content.config.ts       Sammlungen: products (aus src/data/products.json), journal (Markdown)
  data/products.json      (verschoben aus data/) — bleibt die eine Quelle für Produkte + etsyShopUrl
  data/site.ts            SITE_URL, Standard-OG-Bild, Navigation
  content/journal/*.md    Journal-Artikel
  layouts/Basis.astro     ersetzt templates/_layout.html
  components/             Header, Footer, Picture, ProductCard, JsonLd, EtsyCta …
  lib/                    reine Hilfsfunktionen (safeUrl, colorFileSlug, pngDimensions, JSON-LD-Erzeuger)
  pages/                  je Adresse eine Datei; produkte/[slug].astro; sitemap.xml.ts
  styles/                 die vorhandenen CSS-Dateien, im Layout importiert (main.css)
public/
  assets/                 unverändert verschoben (Bild-Adressen bleiben gleich)
  scripts/                main.js, theme.js, shop-filter.js unverändert
  _headers, _redirects, robots.txt, site.webmanifest
```

## Schnittstellen (fest, damit parallel gebaut werden kann)

`src/layouts/Basis.astro` — Props:

| Prop | Typ | Bedeutung |
|---|---|---|
| `title` | string | Seitentitel ohne Zusatz (für og:title/twitter:title) |
| `titleTag` | string? | kompletter `<title>`; Standard `${title} \| Floppa3D` |
| `description` | string | Meta-Beschreibung |
| `path` | string | Ausgabepfad ohne führenden Schrägstrich, z. B. `shop.html`; `''` für die Startseite |
| `ogType` | string? | Standard `website` |
| `ogImage` | string? | absolute Adresse; Standard Logo `full-on-light.png` |
| `jsonLd` | object[]? | zusätzliche JSON-LD-Blöcke; Organisation hängt das Layout immer selbst an (zuerst) |

Slot: Seiteninhalt (landet in `<main id="main">`). Benannter Slot `scripts` für zusätzliche
Skript-Tags am Ende des `<body>` (z. B. `shop-filter.js`).

`src/components/Picture.astro` — bildet `pictureHtml()` aus `build.js` nach:
Props `src` (PNG-Pfad ab `/assets/…`), `alt`, `fallbackW?`, `fallbackH?`, `priority?`, plus
durchgereichte `img`-Attribute. Liest die echten Maße aus der PNG-Datei unter `public/`.

`src/components/ProductCard.astro` — Props `product`, `filterAttrs?: boolean`
(`true` = Variante `productCardWithDataAttrs` für den Shop).

`src/lib/etsy.ts` — `etsyShopUrl` (aus products.json), `safeUrl(url)`.

Produktdaten: Sammlung `products`, Kennung = `slug`. Felder wie in `products.json`
(Schema mit zod, Pflichtfelder streng, `etsyUrl` darf leer sein).

## Abnahme

`npm run build` läuft ohne Fehler und Warnungen durch, `dist/` enthält alle Adressen oben.
Ein Vergleich alt gegen neu (Titel, Meta, Canonical, JSON-LD, sichtbarer Text, Links,
Bildquellen, Klassen) zeigt keine inhaltlichen Unterschiede.
