# Offene Punkte — nur Florian/Paul können das liefern

Änderungen kommen per Commit und Pull Request nach `main`; Cloudflare baut danach selbst (siehe README.md).

## [Etsy] Angebots-Link je Produkt eintragen (je 1 Min)
- **Stand:** Der Etsy-Shop ist live (`etsyShopUrl` ist gesetzt). Bis ein Produkt seinen eigenen Link hat, führt der Knopf auf der Produktseite zum Shop („Im Etsy-Shop ansehen"), und die Strukturdaten (JSON-LD) enthalten noch kein Preisangebot (`offers`).
- **Was fehlt:** Die Adresse des einzelnen Angebots (Listing) für `nordic-flow`, `stack-pot`, `leaf-dock`, `luma-arch`, `cozy-bunny`, `orbit-key-tray`. `custom-fonts` ist Auftragsdruck („auf Anfrage") und verweist auf Kontakt/Auftragsdruck — dort keinen Etsy-Link eintragen.
- **Wo:** `src/data/products.json` → je Produkt `etsyUrl` (Format `https://www.etsy.com/de/listing/…`). Schritt für Schritt: README.md.
- **Danach:** `npm test`, committen, Pull Request. Knopf („Auf Etsy ansehen") und `offers` schalten automatisch um.

## [P7] Instagram-Grid (10 Min)
- **Was fehlt:** Mindestens 6 quadratische Bilder unter `public/assets/social/`
- **Status:** Bewusst noch nicht eingebaut (kein Embed, keine externen Skripte geplant — statisches Grid mit Link aufs Profil). Bilder ablegen, dann Bescheid geben oder selbst ein 6er-Grid in `src/pages/index.astro` ergänzen. Der Instagram-Link steht bereits im Footer.

## [P7] Analytics aktivieren (optional, 5 Min)
- Vorbereitet, aber inaktiv (auskommentierter Block in `src/layouts/Basis.astro`) — Anleitung in `docs/analytics-setup.md`, DSE-Absatz-Entwurf in `docs/dse-absatz-analytics.md` (vor Einbau prüfen!).

## [Bonus] Schrift-Subsets prüfen (optional)
- Fraunces/Inter Tight/JetBrains Mono liegen als Variable Fonts (latin-Subset, SIL-OFL) self-hosted unter `public/assets/fonts/`. Kurz visuell abnehmen.

## [P5] Farbbilder für Swatch-Bildwechsel (optional, ca. 30 Min)
- **Was fehlt:** Je Produkt Fotos/Renders pro Farbvariante — aktuell existiert für KEIN Produkt ein Farbbild
- **Schema:** `public/assets/products/<slug>/farbe-<name>.webp` (Name kleingeschrieben, Leerzeichen → `-`, Umlaute ae/oe/ue/ss; z. B. `farbe-sand-beige.webp`)
- **Danach:** Committen, Pull Request. Beim Build bekommen die Farbfelder automatisch `data-img` (`src/components/ProductColors.astro`) und wechseln das Hauptbild.

## [P6] GLB + USDZ für die sechs Etsy-Produkte exportieren (ca. 20 Min/Produkt)
- **Was fehlt:** 3D-Modelle unter `public/assets/models/<slug>.glb` (+ `.usdz` für iOS-AR)
- **Anleitung:** `tools/README-3D.md` — der Viewer erscheint automatisch (Prüfung im Browser), sobald die Dateien liegen.

## [P8] Foto-Shotlist — echte Bilder statt Stock (je 1 Foto, quer, mind. 1600 px breit)
Die Site nutzt bewusst keine Stockfotos. Diese vier Motive würden die Seiten deutlich aufwerten — einfach fotografieren, als WebP/PNG ablegen und Bescheid geben (eingebaut sind sie noch nicht):
1. **Drucker in Aktion** (Nahaufnahme Düse + sichtbare Schichten) → für Auftragsdruck „Druck"-Station. Ablage: `public/assets/workshop/drucker-aktion.webp`
2. **Filamentrollen als Farbpalette** (mehrere Rollen nebeneinander) → für Material & Nachhaltigkeit. Ablage: `public/assets/workshop/filament-farben.webp`
3. **Hände beim Prüfen/Entgraten eines frischen Drucks** → für About/Qualitätsanspruch. Ablage: `public/assets/workshop/qualitaetspruefung.webp`
4. **Fertig verpacktes Paket** (gern mit Logo-Aufkleber) → für Auftragsdruck „Versand"-Station. Ablage: `public/assets/workshop/paket.webp`
