# 3D-Modelle für den Produkt-Viewer exportieren

Der Viewer auf den Produktseiten blendet sich automatisch ein, sobald unter
`public/assets/models/<slug>.glb` ein Modell liegt (iOS-AR zusätzlich `<slug>.usdz`).
Slugs: `swirl-tree`, `glow-house`, `custom-fonts`.

## Schritt für Schritt (ca. 20 Min pro Produkt)

1. **Import:** STL/3MF des Produkts in Blender importieren (`File → Import`).
2. **Reduzieren:** Modifier „Decimate" hinzufügen, Ratio so wählen, dass
   **< 100.000 Dreiecke** übrig bleiben (Statistik-Overlay einschalten).
3. **Material:** Einfaches Principled-Material mit der Produktfarbe anlegen,
   Roughness hoch (~0.8) für die matte Druck-Optik.
4. **Export:** `File → Export → glTF 2.0 (.glb)` — Format „glTF Binary",
   „+Y Up" aktiviert lassen.
5. **Optimieren:** `npx @gltf-transform/cli optimize input.glb output.glb`
   (Ziel: **< 5 MB** pro Datei).
6. **iOS/AR:** GLB in den Apple **Reality Converter** ziehen → als `.usdz` exportieren.
7. **Ablegen:** Beide Dateien nach `public/assets/models/<slug>.glb` und
   `public/assets/models/<slug>.usdz`, dann committen (Pull Request nach `main`).
   Am Code ist nichts zu ändern — der Viewer erkennt die Dateien im Browser.

## Test

Lokal `npm run dev` starten, Produktseite öffnen → Sektion „In 3D ansehen"
erscheint. Ohne Modell bleibt sie unsichtbar (kein Fehler in der Konsole).
